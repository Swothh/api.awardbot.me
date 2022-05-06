const Partners = require("../../../database/models/partners");
const config = require("../../../../award.config.js");
const express = require("express");
const router = express.Router();

module.exports = client => {
    router.post("/add", async (req, res) => {
        try {
            if (!req._user || !(req._user.permissions || []).some(_p => _p == "*" || _p == "ADD_PARTNER")) return res.json({
                success: false,
                message: "You must have ADD_PARTNER permission to do this!",
                data: null
            });

            if (
                !req.body["banner"] ||
                !req.body["title"] ||
                !req.body["description"] ||
                !req.body["url"]
            ) return res.json({
                success: false,
                message: "Please fill in all the blanks!",
                data: null
            });

            await (new Partners({
                id: Math.random().toString(36).substring(2),
                title: req.body["title"],
                banner: req.body["banner"],
                description: req.body["description"],
                url: req.body["url"]
            })).save();

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