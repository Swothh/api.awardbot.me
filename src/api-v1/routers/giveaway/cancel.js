const giveaways = require("../../../database/models/giveaways.js");
const config = require("../../../../award.config.js");
const { Permissions } = require("discord.js");
const express = require("express");
const router = express.Router();

module.exports = (client, wsSend) => {
    router.get("/:id/cancel", async (req, res) => {
        try {
            const _giveaway = await giveaways.findOne({ id: req.params.id, status: "CONTINUES" });
            if (!_giveaway) {
                res.json({
                    success: false,
                    message: req.locale["giveaway"]["cancel"]["not_found"],
                    data: null
                });
            } else {
                const _checkGuild = await client.guilds.fetch(_giveaway.guild).catch(() => {});
                if (!_checkGuild) return res.json({ success: false, message: req.locale["giveaway"]["cancel"]["bot_not_found"], data: null });
                const _checkMember = await _checkGuild.members.fetch(req.user.id).catch(() => {});
                if (!_checkMember) return res.json({ success: false, message: req.locale["giveaway"]["cancel"]["user_not_found"], data: null });
                if (!_checkMember.permissions.has(Permissions.FLAGS[config.giveawayPerm])) return res.json({ success: false, message: "Access denied!", data: null });
                
                await giveaways.updateOne({ id: req.params.id }, { status: "CANCELLED" });
                wsSend({
                    name: "giveaway_delete",
                    guild: _giveaway.guild,
                    data: {
                        user: req._publicProfile,
                        giveaway: _giveaway
                    }
                });
                res.json({
                    success: true,
                    message: req.locale["global"]["successful"],
                    data: true
                });
            };
        } catch(err) {
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });
    
    return router;
};