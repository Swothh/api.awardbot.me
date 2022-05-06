const users = require('../database/models/users.js');
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: "permission",
  description: "Allows you to manage permissions.",
  options: [
    {
      "type": 1,
      "name": "add",
      "description": "Adds a perm to the user.",
      "options": [
        {
          "type": 6,
          "name": "user",
          "description": "Who to add perm?",
          "required": true
        },
        {
          "type": 3,
          "name": "perm",
          "description": "The name of perm to add.",
          "required": true
        }
      ]
    },
    {
      "type": 1,
      "name": "remove",
      "description": "Removes a perm to the user.",
      "options": [
        {
          "type": 6,
          "name": "user",
          "description": "Who to add perm?",
          "required": true
        },
        {
          "type": 3,
          "name": "perm",
          "description": "The name of perm to remove.",
          "required": true
        }
      ]
    },
    {
      "type": 1,
      "name": "list",
      "description": "Shows the user's perms.",
      "options": [
        {
          "type": 6,
          "name": "user",
          "description": "Whose perms do you want to see?",
          "required": true
        }
      ]
    }
  ],
  run: async (client, interaction) => {
    const guild_settings = require('../database/models/guild-settings.js');
    const findLang = await guild_settings.findOne({ guild: interaction.guild.id });
    const lang = require(`../langs/${findLang.data.language || "en"}.js`);

    const _noPerm = new MessageEmbed()
      .setColor("#ea822d")
      .setDescription(lang.bot.permission.noperm);

    const permCheck = await users.findOne({ user: interaction.user.id });
    if (!permCheck || !permCheck.permissions || !permCheck.permissions.find(_p => _p == "*" || _p == "MANAGE_PERMS")) return await interaction.reply({ embeds: [_noPerm], ephemeral: true });
    const user = interaction.options["_hoistedOptions"].find(_o => _o.type == "USER").user;
    const perm = interaction.options["_hoistedOptions"].find(_o => _o.type == "STRING") ?.value;
    const _user = await users.findOne({ user: user.id }) || {};

    switch (interaction.options["_subcommand"]) {
      case "list":
        await interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor("#ea822d")
              .setTitle(user.username + lang.bot.permission.list_text)
              .setDescription((_user.permissions || []).map((_p, _i) => (
                "**" + (_i + 1) + ")** ``" + _p + "``"
              )).join("\n") + ((_user.permissions || []).length < 1 ? "> **__No permissions!__**" : ""))
          ],
          ephemeral: true
        });
        break;
      case "add":
        await users.updateOne({ user: user.id }, {
          $push: {
            permissions: perm
          }
        });

        await interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor("#ea822d")
              .setDescription(`${lang.bot.permission.add_description.replace("{perm}", perm).replace("{username}", user.username)}`)
          ],
          ephemeral: true
        });
        break;
      case "remove":
        if (![
          "451444721089380373",
          "714451348212678658"
        ].includes(user.id)) {
          await users.updateOne({ user: user.id }, {
            permissions: (_user.permissions || []).filter(_p => _p != perm)
          });
        };

        await interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor("#ea822d")
              .setDescription(`${lang.bot.permission.remove_description.replace("{perm}", perm).replace("{username}", user.username)}`)
          ],
          ephemeral: true
        });
        break;
      default:
        await interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor("#ea822d")
              .setDescription(lang.bot.permission.default)
          ],
          ephemeral: true
        });
        break;
    };
  }
};