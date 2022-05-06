
const giveaways = require("../../../../database/models/giveaways.js");
const invite_checker = require("../../../../database/models/invite-checker.js")
const guild_settings = require("../../../../database/models/guild-settings.js")
const users = require("../../../../database/models/users.js");
const config = require("../../../../../award.config.js");
const axios = require("axios");

module.exports = async (connections, user, giveaway, required, req, client) => {
  try {
    if (!connections["profile"] || !connections["profile"].id) return req.locale["requireds"]["discord"]["connect_account"];
    const _guild = await client.guilds.fetch(giveaway.guild).catch(() => { });

    if (!_guild) {
      await giveaways.updateOne({ id: giveaway.id }, { status: "CANCELLED" });
      return req.locale["requireds"]["discord"]["cancelled"]
    };

    const _member = await _guild.members.fetch(connections["profile"].id).catch(() => { });
    if (!_member) return req.locale["requireds"]["discord"]["join_guild"];
    const _invite = await invite_checker.findOne({ guildId: giveaway.guild, userId: _member.id })
    const invitelimit = giveaway.requireds.find(d => d.invitelimit).invitelimit
    // davet yapmamışsa
    if(!_invite) return req.locale["requireds"]["discord"]["missing_invite"]
      .replace("{invitelimit}", invitelimit)
      .replace("{invite}", "0");
    const normal = _invite.invites.normal || 0
    const left = _invite.invites.left || 0
    const limit_checker = normal - left >= invitelimit
    return limit_checker ? true : req.locale["requireds"]["discord"]["missing_invite"]
      .replace("{invitelimit}", invitelimit)
      .replace("{invite}", normal - left);
  } catch (err) {
    console.log(err);
    return req.locale["global"]["something_went_wrong"];
  };
};
