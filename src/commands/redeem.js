const promo = require('../database/models/promo.js');
const users = require('../database/models/users.js');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const config = require("../../award.config");

module.exports = {
    name: "redeem",
    description: "Send redeem code to channel.",
    options: [
        {
            "type": 3,
            "name": "id",
            "description": "The ID of redeem code to send.",
            "required": true
        }
    ],
    run: async (client, interaction) => {
    const guild_settings = require('../database/models/guild-settings.js');
    const findLang = await guild_settings.findOne({ guild: interaction.guild.id });
    const lang = require(`../langs/${findLang?.data?.language || "en"}.js`);
      
        const _noPerm = new MessageEmbed()
            .setColor("#ea822d")
            .setDescription(lang.bot.redeem.noperm);

        const _noRedeem = new MessageEmbed()
            .setColor("#ea822d")
            .setDescription(lang.bot.redeem.not_found);

        const permCheck = await users.findOne({ user: interaction.user.id });
        if (!permCheck || !permCheck.permissions || !permCheck.permissions.find(_p => _p == "*")) return await interaction.reply({ embeds: [ _noPerm ], ephemeral: true });

        const __id = interaction.options["_hoistedOptions"].find(_o => _o.name == "id").value;
        const code = await promo.findOne({ id: __id });
        if (!code) return await interaction.reply({ embeds: [ _noRedeem ], ephemeral: true });
        
        await interaction.reply({
            embeds: [ 
                new MessageEmbed()
                    .setTitle(lang.bot.redeem.embed_text)
                    .setDescription(`${lang.bot.redeem.embed_description.replace("{code}", code.code).replace("{code_uses}", code.uses).replace("{time}", Math.floor(code.expires_at / 1000))}`)
            ],
            components: [
                new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setLabel('Redeem')
                            .setEmoji('🌐')
                            .setURL(config.website.protocol + '://' + config.website.domain + '/account/redeem')
                            .setStyle('LINK'))
            ]
        });
    }
};