const { version, MessageEmbed } = require('discord.js');
const giveaways = require('../database/models/giveaways.js');

module.exports = {
    name: "statistics",
    description: "Learn the bot statistics.",
    options: [],
    run: async (client, interaction) => {
        const _giveaways = await giveaways.find();
        const data = {
            total_giveaways: _giveaways.length,
            total_finished_giveaways: _giveaways.filter(a => a.status === "FINISHED").length || 0,
            total_cancelled_giveaways: _giveaways.filter(a => a.status === "CANCELLED").length || 0,
            total_continues_giveaways: _giveaways.filter(a => a.status === "CONTINUES").length || 0,
            total_joins: _giveaways.reduce((a, b) => a + b.participants.length, 0) || 0
        };
        const statsEmbed = new MessageEmbed()
        .setColor('#ea822d').setAuthor('award - Statistics', client.user.avatarURL({ dynamic: true }))


        .addField(
            '__Overview__',
            `Guilds: ${client.guilds.cache.size.toLocaleString()}\nUsers: ${client.guilds.cache.reduce((a,b) => a+b.memberCount, 0).toLocaleString()}\nEmojis: ${client.emojis.cache.size.toLocaleString()}\nShard: 1/1\n Giveaways: ${data.total_giveaways}\n **Finished** Giveways: ${data.total_finished_giveaways}\n **Continues** Giveaways: ${data.total_continues_giveaways}\n **Cancelled** Giveaways: ${data.total_cancelled_giveaways}\n Joins: ${data.total_joins}`
        )
        .addField(
            '__Server & Versions__',
            `Website Framework: React\nAPI: Express.js\nNode.js Version: ${process.version}\nDiscord.js Version: v${version}`
        )
        await interaction.reply({
            embeds: [ statsEmbed ]
        });
    }
};