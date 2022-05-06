const giveaways = require("../../../database/models/giveaways.js");
const config = require("../../../../award.config.js");
const benefits = require("../../../util/benefits");
const express = require("express");
const router = express.Router();

module.exports = client => {
    router.get("/:id/stats", async (req, res) => {
        try {
            const _giveaways = await giveaways.find({ guild: req.params["id"] });
            const _benefits = await benefits(req.params["id"]);

            res.json({ 
                success: true, 
                message: req.locale["global"]["successful"], 
                data: {
                    total_giveaways: _giveaways.length || 0,
                    active_giveaways: _giveaways.filter(a => a.status === "CONTINUES").length || 0,
                    ended_giveaways: _giveaways.filter(a => a.status !== "CONTINUES").length || 0,
                    total_joins: _giveaways.reduce((a, b) => a + b.participants.length, 0) || 0,
                    max_limit: _benefits.includes("giveaway_limit_t3") ? config.giveawayLimit[3] : (_benefits.includes("giveaway_limit_t2") ? config.giveawayLimit[2] : (_benefits.includes("giveaway_limit_t1") ? config.giveawayLimit[1] : config.giveawayLimit[0]))
                }
            });
        } catch(err) {
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });

    return router;
}