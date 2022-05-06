//------------------------------------------------------------------------------------//

const users = require("./src/database/models/users.js");
const invite_checker = require("./src/database/models/invite-checker.js")
const guild_settings = require("./src/database/models/guild-settings.js")
const config = require("./award.config.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const Discord = require("discord.js");
const Collection = Discord.Collection;
const client = new Discord.Client(config.client);
require("./src/database/connect.js")();
const axios = require("axios");
const fs = require("fs");
const _commands = [];

//------------------------------------------------------------------------------------//

const _Invite = new Collection(); // İnvite

//------------------------------------------------------------------------------------//

const updateActions = async ({ channel = false, title, color, guild = [] }) => {
  client.user.setStatus("IDLE");
  client.user.setActivity("/help | awardbot.me | " + client.guilds.cache.size.toLocaleString() + " guilds", { type: "WATCHING" });

  if (channel) {
    try {
      const channelFetched = await client.channels.fetch(channel)
      const embed = new Discord.MessageEmbed()
        .setColor(color)
        .setTitle(title)
        .addField('Guild Name', guild.name)
        .addField('Guild Id', guild.id)
        .addField('Member Count', guild.memberCount + '/' + guild.maximumMembers)
        .addField('Owner Id', guild.ownerId)

      if (guild.icon) embed.setThumbnail(
        "https://cdn.discordapp.com/icons/"
        + guild.id + "/" + guild.icon
      );

      if (channelFetched) channelFetched.send({
        embeds: [embed]
      });
    } catch (err) {};
  }

  /*
  try {
    client.guilds.cache.forEach(async (guild) => {
      if (!guild.me.permissions.has("ADMINISTRATOR")) return;
      const _firstInvites = await guild.invites.fetch();
      _Invite.set(
        guild.id,
        new Map(_firstInvites.map((invite) => [invite.code, invite.uses]))
      );
    });
  } catch (err) {
    console.log(err)
  }
  */
};

client.on("guildCreate", (guild) => updateActions({ channel: '944995409787518997', title: 'New guild', color: 'GREEN', guild: guild }));
client.on("guildDelete", (guild) => updateActions({ channel: '944995409787518997', title: 'Guild deleted', color: 'RED', guild: guild }));

//------------------------------------------------------------------------------------//

/*--------- İnvites Action ---------*/

/*
client.on("guildCreate", (guild) => {
  try {
    if (!guild) return;
    if (!guild.memberCount < 20) {
      if (!guild.me.permissions.has("ADMINISTRATOR")) return;
      if (!guild.invites.fetch()) return;
      console.log(`(İ) Server ${guild.name} invitation is loaded.`)
      guild.invites.fetch().then((guildInvites) => {
        _Invite.set(
          guild.id,
          new Map(guildInvites.map((invite) => [invite.code, invite.uses]))
        );
      });
    }
  } catch (err) {
    console.log(err)
  }
});

client.on("inviteDelete", (invite) => {
  try {
    const guild = client.guilds.cache.get(invite.guild.id)
    if (!guild.me.permissions.has("ADMINISTRATOR")) return;
    console.log(`(İ) Server ${guild.name} invitation is loaded.`)
    _Invite.get(invite.guild.id).delete(invite.code);
  } catch (err) {
    console.log(err)
  }
});

client.on("inviteCreate", (invite) => {
  try {
    const guild = client.guilds.cache.get(invite.guild.id)
    if (!guild.me.permissions.has("ADMINISTRATOR")) return;
    console.log(`(İ) Server ${guild.name} invitation is loaded.`)
    _Invite.get(invite.guild.id).set(invite.code, invite.uses);
  } catch (err) {
    console.log(err)
  }
});

async function inviteLoader(guildid) {
  try {
    const guild = client.guilds.cache.get(guildid)
    if(!guild) return;
    if (!guild.me.permissions.has("ADMINISTRATOR")) return;
    console.log(`(İ) Server ${guild.name} invitation is loaded.`)
    return guild.invites.fetch().then((guildInvites) => {
      _Invite.set(
        guild.id,
        new Map(guildInvites.map((invite) => [invite.code, invite.uses]))
      );
    });
  } catch (err) {
    console.log(err)
  }
}

client.on("guildMemberAdd", async (member) => {
  try {
    const guild = client.guilds.cache.get(member.guild.id)
    if (!_Invite.get(member.guild.id)) {
      inviteLoader(member.guild.id);
      return;
    };
    const newInvites = await member.guild.invites.fetch().catch(() => {});
    const oldInvites = _Invite.get(member.guild.id);
    const invite = newInvites.find((i) => i.uses > oldInvites.get(i.code));
    if (invite) {
      const DateNow = Date.now() - member.user.createdAt;
      const query = { guildId: member.guild.id, userId: invite.inviter.id };
      const fake = DateNow / (1000 * 60 * 60 * 24) <= 3 ? true : false;
      const _invit = await invite_checker.findOne(query);
      if (_invit && _invit.guildId && _invit.userId && _invit.invites) {
        await invite_checker.updateOne(query, {
          invites: {
            invites: _invit.invites.invites + 1,
            normal: _invit.invites.normal + (fake ? 0 : 1),
            left: _invit.invites.left,
            fake: _invit.invites.fake + (fake ? 1 : 0),
          },
        });
      } else {
        new invite_checker({
          guildId: member.guild.id,
          userId: invite.inviter.id,
          invites: {
            invites: 1,
            normal: fake ? 0 : 1,
            left: 0,
            fake: fake ? 1 : 0,
          },
        }).save();
      }
    }
  } catch (err) {
    console.log(err)
  }
});

client.on("guildMemberRemove", async (member) => {
  try {
    const guild = client.guilds.cache.get(member.guild.id);
    try {
    if (!_Invite.get(member.guild.id)) {
      inviteLoader(member.guild);
      return;
    };
    const newInvites = await member.guild.invites.fetch().catch(() => {});
    const oldInvites = _Invite.get(member.guild.id);
    const invite = newInvites.find((i) => i.uses > oldInvites.get(i.code));
    if (invite) {
      const query = { guildId: member.guild.id, userId: invite.inviter.id };
      const _invit = await invite_checker.findOne(query);
      if (_invit && _invit.guildId && _invit.userId && _invit.invites) {
        const left = _invit.invites.left || 0
        await invite_checker.updateOne(query, {
          invites: {
            invites: _invit.invites.invites,
            normal: _invit.invites.normal,
            left: left + 1,
            fake: _invit.invites.fake,
          },
        });
      } else {
        new invite_checker({
          guildId: member.guild.id,
          userId: invite.inviter.id,
          invites: {
            invites: 0,
            normal: 0,
            left: 1,
            fake: 0,
          },
        }).save();
      }
    }
    } catch {};
  } catch (err) {
    console.log(err)
  }
});
*/


client.on("guildCreate", guild => {
  try {
    if (guild.memberCount < 20) {
      if ([
        "911264853086318702", // Support Server
        "918981748866551868", // Staff Server
        "936309409347407892", // Promotion Server
        "910528347841372200" // Emojis
      ].includes(guild.id)) return;

      try {
        guild.channels.cache.filter(chx => chx.type === "GUILD_TEXT").random().send('I left because your server has less than 20 members.\n\nThis feature will continue until approved, but once the bot is approved, this feature will be disabled. Thank you for your understanding.').catch(() => { });
      } catch { };
      guild.leave();
    };
  } catch { };
});
//------------------------------------------------------------------------------------//

fs.readdir(config.cmdDir, (err, commands) => {
  if (err) throw new Error(err);
  commands.forEach(async command => {
    try {
      const _cmdFile = require(config.cmdDir + "/" + command);
      const { name, description, options } = (
        typeof _cmdFile == "function" ?
          _cmdFile(client) :
          _cmdFile
      );
      _commands.push({ name, description, options });
    } catch (err) {
      console.error(err);
    };
  });
});

//------------------------------------------------------------------------------------//

global.commands = _commands;
const rest = new REST({ version: "9" }).setToken(config.token);

client.once("ready", async () => {
  try {
    console.log("(!) Started loading application commands!");
    await rest.put(Routes.applicationCommands(client.user.id), { body: _commands });
    console.log("(!) Successfully loaded application commands!");
  } catch (err) {
    console.error(err);
  };
});

//------------------------------------------------------------------------------------//

client.on("interactionCreate", async interaction => {
  try {
    if (!interaction.isCommand()) return;
    fs.readdir(config.cmdDir, (err, commands) => {
      if (err) throw new Error(err);
      commands.forEach(async command => {
        const _command = require(config.cmdDir + "/" + command);
        if (interaction.commandName.toLowerCase() === _command.name.toLowerCase()) _command.run(client, interaction);
      });
    });
  } catch (err) {
    console.error(err);
  };
});

//------------------------------------------------------------------------------------//

client.login(config.token).then(() => {
  console.log("(!) Connected to Discord as " + client.user.username + "!");
  require('./src/api-v1/award.server.js')(client);
}).catch(err => {
  console.error(err);
});

//------------------------------------------------------------------------------------//

client.on("interaction", async interaction => {
  try {
    if (!interaction.user) return;
    if (interaction.type !== "MESSAGE_COMPONENT") return;
    if (interaction.componentType !== "BUTTON") return;
    if (!interaction.customId || !interaction.customId.startsWith("join-")) return;

    const $login = new Discord.MessageEmbed()
      .setColor("#ea822d")
      .setDescription(":x: **|** You must log in to the site once to create your profile**.**");
    const $error = new Discord.MessageEmbed()
      .setColor("#ea822d")
      .setDescription(":x: **|** Something went wrong**.**");

    const _profile = await users.findOne({ user: interaction.user.id });
    if (!_profile) return await interaction.reply({ embeds: [$login], ephemeral: true });
    const _request = await axios.post("https://api.awardbot.me/v1/giveaway/" + interaction.customId.replace("join-", "") + "/join?_token=" + _profile.token).catch(() => { });
    if (!_request || !_request.data) return await interaction.reply({ embeds: [$error], ephemeral: true });

    if (_request.data.success == true) {
      await interaction.reply({
        embeds: [
          new Discord.MessageEmbed()
            .setColor("#ea822d")
            .setDescription(":ballot_box_with_check: **|** You have successfully entered the giveaway**!**")
        ],
        ephemeral: true
      });
    } else {
      await interaction.reply({
        embeds: [
          new Discord.MessageEmbed()
            .setColor("#ea822d")
            .setDescription(":x: **|** " + _request.data.message)
        ],
        ephemeral: true
      });
    };
  } catch (err) {
    console.log(err);
  };
});


//------------------------------------------------------------------------------------//