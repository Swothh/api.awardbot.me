const boosts = require("../database/models/boosts.js");
const config = require("../../award.config.js");
const Discord = require("discord.js");

module.exports = client => {
    setInterval(async () => {
        try {
            const allGuilds = await boosts.find();
            allGuilds.forEach(guild => {
                (guild.boosts || []).forEach(async boost => {
                    if (Date.now() >= Number((boost.expires_at || Infinity))) {
                        await boosts.updateOne({ guild: guild.guild }, {
                            boosts: (guild.boosts || []).filter(_g => _g.id != boost.id)
                        });
                    };
                });
            });
        } catch {};
    }, config.boostIntervalMs);
};