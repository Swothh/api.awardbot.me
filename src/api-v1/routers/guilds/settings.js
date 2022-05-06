const settings = require("../../../database/models/guild-settings.js");
const config = require("../../../../award.config.js");
const { Permissions } = require("discord.js");
const express = require("express");
const router = express.Router();

module.exports = client => {
    router.post("/:id/settings", async (req, res) => {
        try {
            const guild = await client.guilds.fetch(req.params["id"]).catch(() => {});
            if (!guild) return res.json({ success: false, message: req.locale["giveaway"]["create"]["not_found"], data: null });
            const member = await guild.members.fetch(req.user.id).catch(() => {});
            if (!member) return res.json({ success: false, message: req.locale["giveaway"]["create"]["user_not_found"], data: null });
            if (!member.permissions.has(Permissions.FLAGS[config.giveawayPerm])) return res.json({ success: false, message: req.locale["giveaway"]["create"]["access_denied"], data: null });

            switch(req.body["action"]) {
                case "log":
                    if (
                        !req.body["enabled"] || 
                        !req.body["channel"] ||
                        ![ "1", "0" ].includes(req.body["enabled"]) || 
                        typeof req.body["channel"] != "string" ||
                        !guild.channels.cache.get(req.body["channel"])
                    ) return res.json({ success: false, message: "Bad Request", data: null });

                    await settings.updateOne({ guild: guild.id }, {
                        "data.log": {
                            enabled: req.body["enabled"] == 1 ? true : false,
                            channel: req.body["channel"]
                        }
                    }, { upsert: true });

                    res.json({ 
                        success: true, 
                        message: req.locale["global"]["successful"],
                        data: true
                    });
                    break;
                default:
                    res.json({ success: false, message: "Invalid action provided!", data: null });
                    break;
            };
        } catch(err) {
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });
    
    return router;
}