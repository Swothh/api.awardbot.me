const promo = require("../../../database/models/promo.js");
const config = require("../../../../award.config.js");
const express = require("express");
const router = express.Router();

module.exports = client => {
    router.get("/list", async (req, res) => {
        try {
            if (!req._user["permissions"].find(_p => _p == "*" || _p == "VIEW_CODES")) return res.json({ success: false, message: "You must be * or VIEW_CODES permission to use this action!", data: null });
            const $codes = await promo.find({}, { _id: 0, __v: 0 });
            
            res.json({
                success: true,
                message: req.locale["global"]["successful"],
                data: $codes
            });
        } catch(err) {
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });
    
    return router;
};