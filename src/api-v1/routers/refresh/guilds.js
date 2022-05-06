const users = require("../../../database/models/users.js");
const config = require("../../../../award.config.js");
const { Permissions } = require("discord.js");
const fetch = require("node-superfetch");
const express = require("express");
const router = express.Router();

router.get("/guilds", async (req, res) => {
    try {
        const _user = req._user;

        if (
            _user &&
            _user.refreshed_at &&
            _user.refreshed_at.guilds &&
            (Date.now() - Number(_user.refreshed_at.guilds) < 180000)
        ) {
            
        } else {

        };
    } catch(err) {
        console.log(err);
        res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
    };
});

module.exports = router;

/*
let { body: _user } = await fetch.get("https://discord.com/api/v8/users/@me", { headers: { Authorization: "Bearer " + req.user.accessToken } }) || {};
let { body: _guilds } = await fetch.get("https://discord.com/api/v8/users/@me/guilds", { headers: { Authorization: "Bearer " + req.user.accessToken } }) || [];
*/