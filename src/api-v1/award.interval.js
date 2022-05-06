const giveaways = require("../database/models/giveaways.js");
const Users = require("../database/models/users.js");
const config = require("../../award.config.js");
const Discord = require("discord.js");

module.exports = (client, wsSend) => {
    setInterval(async () => {
        const allGiveaways = await giveaways.find({ status: "CONTINUES" });
        allGiveaways.forEach(async giveaway => {
            if ((Date.now() - giveaway.started_at) >= giveaway.duration) {
                let winners = [];
                let participants = giveaway.participants.filter(user => client.users.cache.get(user));
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
                                    status: "FINISHED",
                                    winners: winners.map(_w => ({
                                        id: _w.id,
                                        avatar: _w.avatar,
                                        username: _w.username + "#" + _w.discriminator
                                    }))
                                });
                                wsSend({
                                    name: "giveaway_finish",
                                    guild: giveaway.guild,
                                    data: {
                                        user: client.user,
                                        giveaway: giveaway,
                                        winners: giveaway.winners
                                    }
                                });
                                try {
                                    if (giveaway.auto_rewards) {
                                        console.log(giveaway.auto_rewards, typeof giveaway.auto_rewards)
                                        winners.forEach(async (_w, ind) => {
                                            const reward = giveaway.auto_rewards[ind];
                                            console.log(reward);
                                            if (!reward) return;
                                            await Users.updateOne({
                                                user: _w.id
                                            }, {
                                                $push: {
                                                    notifications: {
                                                        giveaway,
                                                        reward
                                                    }
                                                }
                                            });
                                        });
                                    };

                                    const channel = guild.channels.cache.get(giveaway.channel);
                                    const finishedEmbed = new Discord.MessageEmbed()
                                    .setColor('#ea822d').setTitle(giveaway.title).setDescription(giveaway.description)
                                    .addField('__Prize__', giveaway.prize)
                                    .setFooter('award - Create advanced giveaways!')
                                    .addField('__Winners__', winners.map(_w => "<@" + _w.id + ">").join("`,` "));
                                    channel.send({ embeds: [finishedEmbed] });
                                } catch(err) {
                                    console.log(err);
                                };
                            };
                        });
                    };
                };
            };
        });
    }, config.intervalMs);
};