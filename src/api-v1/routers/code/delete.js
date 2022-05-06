const promo = require("../../../database/models/promo.js");
const config = require("../../../../award.config.js");
const express = require("express");
const { mongo } = require("mongoose");
const router = express.Router();

module.exports = client => {
    router.get("/delete", async (req, res) => {
        try {
            if (!req._user["permissions"].find(_p => _p == "*" || _p == "DELETE_CODES")) return res.json({ success: false, message: "You must be * or DELETE_CODES permission to use this action!", data: null });
            if (!req.query["i"]) return res.json({ success: false, message: "No 'i' provided!", data: null });
            
            await promo.deleteOne({
                id: req.query["i"]
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