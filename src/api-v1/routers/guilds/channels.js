const giveaways = require("../../../database/models/giveaways.js");
const config = require("../../../../award.config.js");
const { Permissions } = require("discord.js");
const express = require("express");
const router = express.Router();

module.exports = client => {
    router.get("/:id/channels", async (req, res) => {
        try {
            const _guild = await client.guilds.fetch(req.params["id"]).catch(() => {});
            if (!_guild) {
                res.json({ 
                    success: false, 
                    message: req.locale["guilds"]["channels"]["not_found"], 
                    data: null
                });
            } else {
                res.json({ 
                    success: true, 
                    message: req.locale["global"]["successful"], 
                    data: _guild.channels.cache.filter(_channel => _channel.type == "GUILD_TEXT").map(_channel => ({
                        id: _channel.id,
                        name: _channel.name
                    })) 
                });
            };
        } catch(err) {
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });
    
    return router;
}