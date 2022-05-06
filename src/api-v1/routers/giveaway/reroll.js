const giveaways = require("../../../database/models/giveaways.js");
const config = require("../../../../award.config.js");
const benefits = require("../../../util/benefits");
const Discord = require("discord.js");
const Permissions = Discord.Permissions;
const express = require("express");
const router = express.Router();
module.exports = (client, wsSend) => {
    router.get("/:id/reroll", async (req, res) => {
        try {
            const giveaway = await giveaways.findOne({ id: req.params.id, status: "FINISHED" });
            if (!giveaway) {
                res.json({
                    success: false,
                    message: req.locale["giveaway"]["cancel"]["not_found"],
                    data: null
                });
            } else {
                const __guild = await client.guilds.fetch(giveaway.guild).catch(() => {});
                if (!__guild) return res.json({ success: false, message: req.locale["giveaway"]["create"]["not_found"], data: null });
                const __member = await __guild.members.fetch(req.user.id).catch(() => {});
                if (!__member) return res.json({ success: false, message: req.locale["giveaway"]["create"]["user_not_found"], data: null });
                if (!__member.permissions.has(Permissions.FLAGS[config.giveawayPerm])) return res.json({ success: false, message: req.locale["giveaway"]["create"]["access_denied"], data: null });
                const _benefits = await benefits(giveaway.guild);
                const _limit = _benefits.includes("reroll_limit_t3") ? config.rerollLimit[3] : (_benefits.includes("reroll_limit_t2") ? config.rerollLimit[2] : (_benefits.includes("reroll_limit_t1") ? config.rerollLimit[1] : config.rerollLimit[0]));
                if ((giveaway.rerolled || 0) >= _limit) return res.json({ success: false, message: "You've reached the reroll limit!", data: null });

                let winners = [];
                let participants = giveaway.participants;
                const guild = await client.guilds.fetch(giveaway.guild).catch(() => {});
                if (!guild) return await giveaways.updateOne({ id: giveaway.id }, { status: "CANCELLED" });
                if (participants.length == 0) return await giveaways.updateOne({ id: giveaway.id }, { status: "CANCELLED" });
                if (participants.length < Number(giveaway.winners_count)) return await giveaways.updateOne({ id: giveaway.id }, { status: "CANCELLED" });

                for(let i = 0; i < Number(giveaway.winners_count); i++) {
                    const winner = participants[Math.floor(Math.random() * participants.length)];
                    if (!winner) return;
                    participants = participants.filter(item => item !== winner);
                    winners.push(winner);

                    if (i == (Number(giveaway.winners_count) - 1)) {
                        winners.forEach(async (_winner, _index) => {
                            if (!_winner) return winners[_index] = undefined;
                            const member = await guild.members.fetch(_winner).catch(() => {});
                            if (!member) return winners[_index] = undefined;
                            winners[_index] = member.user || {};

                            if (_index == (winners.length - 1)) {
                                await giveaways.updateOne({ id: giveaway.id }, {
                                    rerolled: (giveaway.rerolled || 0) + 1,
                                    winners: winners.map(_w => ({
                                        id: _w.id,
                                        avatar: _w.avatar,
                                        username: _w.username + "#" + _w.discriminator
                                    }))
                                });
                                wsSend({
                                    name: "giveaway_reroll",
                                    guild: giveaway.guild,
                                    data: {
                                        user: req._publicProfile,
                                        giveaway: giveaway,
                                        winners: giveaway.winners
                                    }
                                });
                                try {
                                    const channel = client.channels.cache.get(giveaway.channel)
                                    const finishedEmbed = new Discord.MessageEmbed()
                                        .setColor('#ea822d').setTitle(giveaway.title+' - Reroll').setDescription(giveaway.description)
                                        .addField('__Prize__', giveaway.prize)
                                        .setURL('https://awardbot.me/g/'+giveaway.id)
                                        .setFooter('award - Create advanced giveaways!')
                                        .addField('__New Winners__', winners.map(_w => "<@" + _w.id + ">").join("`,` "));
                                    try {
                                        console.log('REROLL EMBED\n'+err+'\nREROLL EMBED')
                                        channel.messages.cache.get(giveaway.message).reply({ embeds: [finishedEmbed] });
                                    } catch(err) {
                                        channel.send({ embeds: [finishedEmbed] })
                                    }
                                } catch(err) {
                                    console.log('REROLL EMBED\n'+err+'\nREROLL EMBED')
                                };
                                
                                res.json({
                                    success: true,
                                    message: req.locale["global"]["successful"],
                                    data: true
                                });
                            };
                        });
                    };
                };
            };
        } catch(err) {
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });
    
    return router;
};