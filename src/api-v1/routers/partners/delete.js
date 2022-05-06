const Partners = require("../../../database/models/partners");
const config = require("../../../../award.config.js");
const express = require("express");
const router = express.Router();

module.exports = client => {
    router.post("/delete", async (req, res) => {
        try {
            if (!req._user || !(req._user.permissions || []).some(_p => _p == "*" || _p == "DELETE_PARTNER")) return res.json({
                success: false,
                message: "You must have DELETE_PARTNER permission to do this!",
                data: null
            });

            if (!req.body["id"]) return res.json({
                success: false,
                message: "Please fill in all the blanks!",
                data: null
            });

            await Partners.deleteOne({
                id: req.body["id"]
            });

            res.json({
                success: true,
                message: req.locale["global"]["successful"],
                data: true
            });            
        } catch(err) {
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });
    
    return router;
};