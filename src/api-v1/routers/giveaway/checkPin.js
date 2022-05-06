const giveaways = require("../../../database/models/giveaways.js");
const config = require("../../../../award.config.js");
const { Permissions } = require("discord.js");
const express = require("express");
const router = express.Router();

module.exports = client => {
    router.post("/:id/check/pin", async (req, res) => {
        
        try {
            const _giveaway = await giveaways.findOne({ id: req.params.id, pin: req.query.q }, {
                _id: 0,
                __v: 0
            });
            if (!_giveaway) {
                res.json({
                    success: false,
                    message: req.locale["giveaway"]["pin"]["not_correct"],
                    data: null
                });
            } else {
                res.json({
                    success: true,
                    message: req.locale["global"]["successful"],
                    data: null
                });
            };
        } catch(err) {
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });
    
    return router;
};