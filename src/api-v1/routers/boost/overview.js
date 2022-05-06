const boosts = require("../../../database/models/boosts.js");
const config = require("../../../../award.config.js");
const express = require("express");
const router = express.Router();

module.exports = client => {
    router.post("/:id", async (req, res) => {
        try {
            const check = await client.guilds.fetch(req.params["id"]).catch(() => {});
            if (!check) return res.json({ success: false, message: req.locale["boost"]["not_found"], data: null });
            let overview = await boosts.findOne({ guild: req.params["id"] }, { _id: 0, __v: 0 });
            
            if (!overview) {
                await new boosts({ guild: req.params["id"] }).save();
                overview = await boosts.findOne({ guild: req.params["id"] });
            };

            const [ _l1, _l2, _l3 ] = config.boostLevels;
            const _bc = (overview.boosts || []).length;
            let _all = [];

            if ((req._user["boosts"] || []).length > 0) {
                _all = await boosts.find();
            };

            const _lvl = (_bc >= _l1 ? (
                _bc >= _l2 ? (
                    _bc >= _l3 ? 3 : 2
                ) : 1
            ) : 0);

            const _bl = (req._user["boosts"] || []).map(_b => {
                const _used = _all.find(_g => _g.boosts.find(__b => __b.id == _b.id));
                const _guild = _used ? client.guilds.cache.get(_used.guild) : null;

                return {
                    id: _b.id,
                    expires_at: _b.expires_at,
                    used_in: _guild ? _guild.name : false,
                    used_in_id: _guild ? _guild.id : false
                };
            });

            res.json({
                success: true,
                message: req.locale["global"]["successful"],
                data: {
                    levels: config.levelNames,
                    prices: config.boostLevels,
                    guild: {
                        id: overview.guild,
                        name: check.name,
                        icon: check.icon,
                        boosts: overview.boosts,
                        level: _lvl,
                        percent: _bc * (100 / _l3),
                        benefits: config.benefits(_lvl)
                    },
                    user: {
                        id: req.user["id"],
                        boosts_count: _bl.filter(_b => !_b.used_in).length,
                        boosts: _bl
                    }
                }
            });
        } catch(err) {
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });
    
    return router;
};