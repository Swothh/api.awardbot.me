const giveaways = require("../../../../database/models/giveaways.js");
const users = require("../../../../database/models/users.js");
const config = require("../../../../../award.config.js");
const axios = require("axios");

module.exports = async (connections, user, giveaway, required, req, client) => {
    try {
        if (!connections["profile"] || !connections["profile"].id) return req.locale["requireds"]["discord"]["connect_account"];
        const _guild = await client.guilds.fetch(giveaway.guild).catch(() => {});
        
        if (!_guild) {
            await giveaways.updateOne({ id: giveaway.id }, { status: "CANCELLED" });
            return req.locale["requireds"]["discord"]["cancelled"]
        };

        const _member = await _guild.members.fetch(connections["profile"].id).catch(() => {});
        return !_member ? req.locale["requireds"]["discord"]["join_guild"] : true;
    } catch(err) {
        console.log(err);
        return req.locale["global"]["something_went_wrong"];
    };
};