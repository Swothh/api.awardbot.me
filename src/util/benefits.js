const boosts = require("../database/models/boosts.js");
const config = require("../../award.config.js");

module.exports = async guild => {
    if (!guild) return [];
    const _guild = await boosts.findOne({ guild });
    if (!_guild) return [];

    const [ _l1, _l2, _l3 ] = config.boostLevels;
    const _bc = (_guild.boosts || []).length;

    return config.benefits((_bc >= _l1 ? (
        _bc >= _l2 ? (
            _bc >= _l3 ? 3 : 2
        ) : 1
    ) : 0))
    .filter(_b => _b.unlocked == true)
    .map(_b => _b.slug);
};