const { MessageEmbed, Interaction } = require('discord.js');
const guild_settings = require('../database/models/guild-settings.js');
const languagesArray = [
  { iso: "tr", label: "TR", fullName: "Türkçe" },
  { iso: "en", label: "EN", fullName: "English" },
]
module.exports = {
  name: "language",
  description: "You can change the language of the bot.",
  options: [
    {
      name: "iso",
      type: 3,
      description: "Select the language to change.",
      required: true,
      choices: languagesArray.map(a => {
        return {
          value: a.iso,
          name: `${a.fullName} (${a.label})`
        }
      })
    }
  ],
  run: async (client, interaction) => {
    if(!interaction.member.permissions.has('MANAGE_GUILD')) return interaction.reply({ content: 'Access denied.', ephemeral: true });
    const defaultLang = { iso: "en", label: "EN", fullName: "English" };
    const findLang = await guild_settings.findOne({ guild: interaction.guild.id });
    const selectedLanguage = interaction.options.get("iso") ?.value;
    let findChanged = languagesArray.find(a => a.iso === selectedLanguage);
    let oldLanguage = languagesArray.find(a => a.iso === findLang ?.data ?.language) || defaultLang;
    const lang = require(`../langs/${findLang?.data?.language || "en"}.js`);
    let changeText = lang.bot.language.embed_description
    await guild_settings.updateOne({
      guild: interaction.guild.id
    }, {
        $set: {
          'data.language': findChanged.iso
        }
      }, { upsert: true });
    await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`award - ` + lang.bot.language.text)
          .setColor('#ea822d')
          .setDescription(changeText)
          .addField(lang.bot.language.from, `${oldLanguage.fullName} (${oldLanguage.label})`, true)
          .addField(lang.bot.language.to, `${findChanged.fullName} (${findChanged.label})`, true)
      ],
    });
  }
}