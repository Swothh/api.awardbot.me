const logdata = require("../../../database/models/logs.js");
const config = require("../../../../award.config.js");
const { Permissions } = require("discord.js");
const express = require("express");
const router = express.Router();

module.exports = client => {
    router.get("/:id/log", async (req, res) => {
        try {
            const guild = await client.guilds.fetch(req.params["id"]).catch(() => {});
            const log = await logdata.find({ guild: req.params.id });
            res.json({ success: true, message: req.locale["global"]["successful"], data: log || [] });
        } catch(err) {
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });
    
    return router;
}