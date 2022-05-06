const giveaways = require("../../../database/models/giveaways.js");
const config = require("../../../../award.config.js");
const { Permissions } = require("discord.js");
const express = require("express");
const router = express.Router();

module.exports = client => {
    router.get("/:id/roles", async (req, res) => {
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
                    data: _guild.roles.cache.map(_role => ({
                        id: _role.id,
                        name: _role.name,
                        color: _role.hexColor
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