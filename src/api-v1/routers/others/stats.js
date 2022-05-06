const config = require("../../../../award.config.js");
const express = require("express");
const router = express.Router();
const giveaways = require("../../../database/models/giveaways.js");

module.exports = client => {
    router.get("/stats", async (req, res) => {
        try {
            const _giveaways = await giveaways.find();
            res.json({
                success: true,
                message: req.locale["global"]["successful"],
                data: {
                    guilds: client.guilds.cache.size,
                    users: client.guilds.cache.reduce((a,b) => a+b.memberCount, 0),
                    emojis: client.emojis.cache.size,
                    total_giveaways: _giveaways.length,
                    total_finished_giveaways: _giveaways.filter(a => a.status === "FINISHED").length || 0,
                    total_cancelled_giveaways: _giveaways.filter(a => a.status === "CANCELLED").length || 0,
                    total_continues_giveaways: _giveaways.filter(a => a.status === "CONTINUES").length || 0,
                    total_joins: _giveaways.reduce((a, b) => a + b.participants.length, 0) || 0
                }
            })
        } catch(err) {
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });
    
    return router;
};