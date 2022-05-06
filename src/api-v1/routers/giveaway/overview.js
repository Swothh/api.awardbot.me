const giveaways = require("../../../database/models/giveaways.js");
const config = require("../../../../award.config.js");
const { Permissions } = require("discord.js");
const express = require("express");
const router = express.Router();

module.exports = client => {
    router.get("/:id/overview", async (req, res) => {
        
        try {
            const _giveaway = await giveaways.findOne({ id: req.params.id }, {
                _id: 0,
                __v: 0,
            }).select('-pin');

            if (!_giveaway) {
                res.json({
                    success: false,
                    message: req.locale["giveaway"]["overview"]["not_found"],
                    data: null
                });
            } else {
                const _guild = client.guilds.cache.get(_giveaway.guild);
                let _requireds = _giveaway.requireds;

                _requireds.forEach((item, index) => {
                    item.img = config.requireds[item.provider] ? config.requireds[item.provider].img : null;
                    item.bg = config.requireds[item.provider] ? config.requireds[item.provider].bg : null;
                    item.border = config.requireds[item.provider] ? config.requireds[item.provider].border : null;
                    _requireds[index].url = config.requireds[item.provider].url
                        .split("{ID_HERE}").join(item.id)
                        .split("{USER_HERE}").join(item.username)
                        .split("{INVITE_HERE}").join(item.invite || "");
                });

                res.json({
                    success: true,
                    message: req.locale["global"]["successful"],
                    data: Object.assign(_giveaway, {
                        guildIcon: _guild ? _guild.icon : null
                    })
                });
            };
        } catch(err) {
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });
    
    return router;
};