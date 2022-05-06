const settings = require("../../../database/models/guild-settings.js");
const config = require("../../../../award.config.js");
const { Permissions } = require("discord.js");
const express = require("express");
const router = express.Router();

module.exports = client => {
    router.get("/:id/check", async (req, res) => {
        try {
            let _guild = await client.guilds.fetch(req.params["id"]).catch(() => {});
            if (!_guild) return res.json({ success: true, message: req.locale["global"]["successful"], data: false });
            const _settings = await settings.findOne({ guild: _guild.id });
            res.json({ success: true, message: req.locale["global"]["successful"], data: { ..._guild.toJSON(), _settings: _settings ? _settings.data : {} } });
        } catch(err) {
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });
    
    return router;
}