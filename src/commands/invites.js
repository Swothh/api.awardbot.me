const { MessageEmbed } = require('discord.js');
const invite_checker = require("../database/models/invite-checker.js")

module.exports = {
  name: "invites",
  description: "You look at your invitation information.",
  options: [
    {
      "type": 1,
      "name": "invite",
      "description": "Shows the user's invitations.",
      "options": [
        {
          "type": 6,
          "name": "user",
          "description": "Whose invites do you want to see?",
          "required": true
        }
      ]
    }
  ],
  run: async (client, interaction) => {
    const guild_settings = require('../database/models/guild-settings.js');
    const findLang = await guild_settings.findOne({ guild: interaction.guild.id });
    const lang = require(`../langs/${findLang?.data?.language || "en"}.js`);

    const user = interaction.options["_hoistedOptions"].find(_o => _o.type == "USER").user;
    const _user = await invite_checker.findOne({ userId: user.id, guildId: interaction.guild.id }) || {};
    if (!_user || !_user.guildId || !_user.userId) return await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`award - ${user.username} ${lang.bot.invite.invitations}`)
          .setColor('#ea822d')
          .setDescription(lang.bot.invite.not_found)
          .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
      ], ephemeral: true
    });

    switch (interaction.options["_subcommand"]) {
      case "invite":
        await interaction.reply({
          embeds: [
            new MessageEmbed()
              .setTitle(`award - ${user.username} ${lang.bot.invite.invitations}`)
              .setColor('#ea822d')
              .setDescription(lang.bot.invite.description)
              .addFields(
                { name: `${lang.bot.invite.all_invites}`, value: `${_user.invites.invites}` },
                { name: `${lang.bot.invite.regular}`, value: `${_user.invites.normal || 0}`, inline: true },
                { name: `${lang.bot.invite.left}`, value: `${_user.invites.left || 0}`, inline: true },
                { name: `${lang.bot.invite.fake}`, value: `${_user.invites.fake || 0}`, inline: true },
              )
              .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
          ],
        });
        break;
    }
  }
};