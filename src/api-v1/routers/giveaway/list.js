const giveaways = require("../../../database/models/giveaways.js");
const config = require("../../../../award.config.js");
const { Permissions } = require("discord.js");
const express = require("express");
const router = express.Router();

module.exports = client => {
    router.get("/list", async (req, res) => {
        try {
            let _perPage = req.query.count;
            let _page = req.query.page;
            if (!_perPage) _perPage = 12;
            if (_page && isNaN(_page) || _page && Number(_page) < 1 ) _page = 1;
            
            const _guilds = (req.user.guilds || [])
                .filter(_guild => req.query["id"] ? (_guild.id == req.query["id"]) : true)
                .filter(_guild => new Permissions(_guild.permissions_new).has(config.giveawayPerm));

            if (_guilds.length > 0) {
                const _giveaways = await giveaways.find({ guild: { $in: _guilds.map(__ => __.id) } }, { _id: 0, __v: 0 });
                res.json({
                    success: true,
                    message: req.locale["global"]["successful"],
                    data: _page ? _giveaways.slice((Number(_page) - 1) * _perPage, Number(_page) * _perPage) : _giveaways
                });
            } else {
                res.json({
                    success: true,
                    message: req.locale["global"]["successful"],
                    data: []
                });
            };
        } catch(err) {
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });

    return router;
};