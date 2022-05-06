const boosts = require("../../../database/models/boosts.js");
const config = require("../../../../award.config.js");
const express = require("express");
const router = express.Router();

module.exports = (client, wsSend) => {
    router.put("/:id", async (req, res) => {
        try {
            let overview = await boosts.findOne({ guild: req.params["id"] }, { _id: 0, __v: 0 });
            if (!overview) return res.json({ success: false, message: req.locale["boost"]["not_found"], data: null });
            if (!req.query["b"] || !(req._user["boosts"] || []).find(_b => _b.id == req.query["b"])) return res.json({ success: false, message: req.locale["boost"]["invalid_boost"], data: null });

            let boostsList = await boosts.find({ "boosts.id": req.query["b"] }, { _id: 0, __v: 0 });
            if (boostsList.length > 0) return res.json({ success: false, message: req.locale["boost"]["using"], data: null });
            let checkExpire = (req._user["boosts"] || []).find(_b => _b.id == req.query["b"]);
            if (Date.now() >= Number(checkExpire.expires_at)) return res.json({ success: false, message: req.locale["boost"]["expired"], data: null });

            await boosts.updateOne({ guild: req.params["id"] }, {
                $push: {
                    boosts: {
                        id: req.query["b"],
                        expires_at: checkExpire.expires_at,
                        user: {
                            id: req.user["id"],
                            avatar: req.user["avatar"],
                            username: req.user["username"],
                            discriminator: req.user["discriminator"]
                        }
                    }
                }
            });

            wsSend({
                name: "boost",
                guild: req.params["id"],
                data: {
                    user: req._publicProfile
                }
            });

            res.json({
                success: true,
                message: req.locale["global"]["successful"],
                data: null
            });
        } catch(err) {
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });
    
    return router;
};