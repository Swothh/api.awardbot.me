const promo = require("../../../database/models/promo.js");
const users = require("../../../database/models/users.js");
const config = require("../../../../award.config.js");
const express = require("express");
const router = express.Router();

module.exports = client => {
    router.get("/use", async (req, res) => {
        try {
            if (!req.query["c"]) return res.json({ success: false, message: "Please specify a promo code!", data: null });
            const __p = await promo.findOne({ code: req.query["c"] });
            if (!__p) return res.json({ success: false, message: "You have specified an invalid promo code!", data: null });
            if (Date.now() >= Number(__p.expires_at)) return res.json({ success: false, message: "The specified promo code has expired!", data: null });
            if (__p.used_by.length >= __p.uses) return res.json({ success: false, message: "The specified promo code has reached its usage limit!", data: null });
            if (__p.used_by.includes(req.user.id)) return res.json({ success: false, message: "You've already used this promo code!", data: null });

            await promo.updateOne({ code: req.query["c"] }, {
                $push: {
                    used_by: [
                        req.user.id
                    ]
                }
            });

            await users.updateOne({ user: req.user.id }, {
                $push: {
                    boosts: Array.from({ length: __p.boost_count }).map(() => {
                        const _id = require("../../../util/key")(10);
                        const _time = 1000 * 60 * 60 * 24 * 30;

                        return {
                            id: _id,
                            expires_at: Date.now() + _time
                        };
                    })
                }
            });

            res.json({
                success: true,
                message: req.locale["global"]["successful"],
                data: {
                    count: __p.boost_count
                }
            });
        } catch(err) {
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });
    
    return router;
};