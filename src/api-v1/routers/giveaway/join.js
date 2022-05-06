const giveaways = require("../../../database/models/giveaways.js");
const config = require("../../../../award.config.js");
const { Permissions } = require("discord.js");
const express = require("express");
const router = express.Router();

module.exports = (client, wsSend) => {
    router.post("/:id/join", async (req, res) => {
        try {
            const _giveaway = await giveaways.findOne({ id: req.params["id"], status: "CONTINUES" });
            if (!_giveaway) return res.json({ success: false, message: req.locale["giveaway"]["join"]["not_found"], data: null });
            if(_giveaway.pinActive) {
                if(!req.query.pin) return res.json({ success: false, message: req.locale["giveaway"]["pin"]["not_correct"], data: null });
                if(Number(req.query.pin) !== Number(_giveaway.pin)) return res.json({ success: false, message: req.locale["giveaway"]["pin"]["not_correct"], data: null });
            }
            if (_giveaway.participants.find(_user => _user == req.user.id)) return res.json({ success: false, message: req.locale["giveaway"]["join"]["joined"], data: null });
            const _check = await Promise.all([
                _giveaway["requireds"].map(async _item => {
                    const _status = await require("../requireds/" + _item.provider + "/" + _item.type)(req._user, req.user, _giveaway, _item, req, client);
                    return { provider: _item.provider, type: _item.type, success: _status };
                })
            ]);

            const _promiseAll = await Promise.all(_check[0]);
            const _invalidCheck = _promiseAll.find(_valid => _valid.success !== true);
            if (_invalidCheck) {
                return res.json({ 
                    success: false, 
                    message: "[" + [ _invalidCheck.provider, _invalidCheck.type ].join(".") + "] " + _invalidCheck.success, 
                    data: null 
                });
            };

            await giveaways.updateOne({
                id: req.params["id"],
                status: "CONTINUES"
            }, {
                $push: {
                    participants: req.user.id
                }
            });

            wsSend({
                name: "giveaway_join",
                guild: _giveaway.guild,
                data: {
                    user: req._publicProfile,
                    giveaway: _giveaway
                }
            });

            res.json({
                success: true,
                message: req.locale["global"]["successful"],
                data: true
            });
        } catch(err) {
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });

    return router;
};