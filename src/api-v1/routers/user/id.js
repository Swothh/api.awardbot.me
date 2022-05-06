const giveaways = require("../../../database/models/giveaways.js");
const users = require("../../../database/models/users.js");
const config = require("../../../../award.config.js");
const benefits = require("../../../util/benefits");
const { Permissions } = require("discord.js");
const express = require("express");
const router = express.Router();

module.exports = client => {
    router.get("/:id/profile", async (req, res) => {
        try {
            const _user = await users.findOne({ user: req.params.id }, { _id: 0 }).select('user banned profile.id profile.avatar profile.username profile.discriminator profile.fetchedAt github.name github.username youtube.id youtube.name twitch.name twitch.username twitter.name twitter.username tiktok.id tiktok.username permissions');
            if(!_user) return res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
            res.json({ success: true, message: req.locale["global"]["successful"], data: _user })
        } catch(err) {
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });
    router.get("/:id/giveaways", async (req, res) => {
        try {
            const _giveaways = await giveaways.find({}, { _id: 0, __v: 0 });
            const filteredGiveaways = _giveaways.filter(a => a.participants.includes(req.params.id));
            res.json({ 
                success: true, 
                message: req.locale["global"]["successful"], 
                data: filteredGiveaways.map(_giveaway => {
                    _giveaway.requireds.forEach((item, index) => {
                        item.img = config.requireds[item.provider] ? config.requireds[item.provider].img : null;
                        item.bg = config.requireds[item.provider] ? config.requireds[item.provider].bg : null;
                        item.border = config.requireds[item.provider] ? config.requireds[item.provider].border : null;
                        _giveaway.requireds[index].url = config.requireds[item.provider].url
                            .split("{ID_HERE}").join(item.id)
                            .split("{USER_HERE}").join(item.username)
                            .split("{INVITE_HERE}").join(item.invite || "");
                    });

                    return _giveaway;
                })
            });
        } catch(err) {
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });

    return router;
};