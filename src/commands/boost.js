const boosts = require('../database/models/boosts.js');
const users = require('../database/models/users.js');
const { MessageEmbed } = require('discord.js');
const moment = require("moment");
require('moment-duration-format');

module.exports = {
    name: "boost",
    description: "Allows you to manage boosts.",
    options: [
        {
            "type": 1,
            "name": "add",
            "description": "Adds a boost to the user.",
            "options": [
                {
                    "type": 6,
                    "name": "user",
                    "description": "Who to add Boost?",
                    "required": true
                },
                {
                    "type": 4,
                    "name": "count",
                    "description": "The amount of boost to add.",
                    "required": true
                }
            ]
        },
        {
            "type": 1,
            "name": "remove",
            "description": "Removes a boost to the user.",
            "options": [
                {
                    "type": 6,
                    "name": "user",
                    "description": "Who to add Boost?",
                    "required": true
                },
                {
                    "type": 3,
                    "name": "id",
                    "description": "The ID of boost to remove.",
                    "required": true
                }
            ]
        },
        {
            "type": 1,
            "name": "list",
            "description": "Shows the user's boosts.",
            "options": [
                {
                    "type": 6,
                    "name": "user",
                    "description": "Whose boosts do you want to see?",
                    "required": true
                },
                {
                    "type": 4,
                    "name": "page",
                    "description": "The number of the page to be displayed.",
                    "required": true
                }
            ]
        }
    ],
    run: async (client, interaction) => {
        const _noPerm = new MessageEmbed()
            .setColor("#ea822d")
            .setDescription(":x: **|** You must be `*` or `MANAGE_BOOSTS` permission to use this command**!**");

        const _noBoost = new MessageEmbed()
            .setColor("#ea822d")
            .setDescription(":x: **|** Boost not found**!**");

        const permCheck = await users.findOne({ user: interaction.user.id });
        if (!permCheck || !permCheck.permissions || !permCheck.permissions.find(_p => _p == "*" || _p == "MANAGE_BOOSTS")) return await interaction.reply({ embeds: [ _noPerm ], ephemeral: true });

        const user = interaction.options["_hoistedOptions"].find(_o => _o.type == "USER").user;
        const boostCheck = await users.findOne({ user: user.id }) || {};

        switch(interaction.options["_subcommand"]) {
            case "list":
                const page = interaction.options["_hoistedOptions"].find(_o => _o.type == "INTEGER").value;
                const allBoosts = await boosts.find();
                const _perPage = 5;

                await interaction.reply({ 
                    embeds: [
                        new MessageEmbed()
                            .setColor("#ea822d")
                            .setTitle(user.username + "'s Boosts")
                            .setDescription((boostCheck.boosts || []).slice((page - 1) * _perPage, page * _perPage).map((_b, _i) => {
                                let boostingServer = allBoosts.find(_g => _g.boosts.find(__b => __b.id == _b.id));
                                let fetchGuild = boostingServer ? client.guilds.cache.get(boostingServer.guild) : null;

                                return "`🏷️` **__Index:__** `" + _i + "` \n`💻` **__ID:__** `" + _b.id + "` \n`⏲️` **__Expires in:__** `" + moment.duration(Number(_b.expires_at) - Date.now()).format(`D [days], H [hours], m [minutes], s [seconds]`) + "` \n`💎` **__Used in:__** `" + (boostingServer ? (fetchGuild.name + " (" + boostingServer.guild + ")") : "Not used!") + "`";
                            }).join("\n\n") + ((boostCheck.boosts || []).length < 1 ? "> **__No boosts!__**" : ""))
                    ], 
                    ephemeral: true 
                });
                break;
            case "add":
                const count = interaction.options["_hoistedOptions"].find(_o => _o.type == "INTEGER").value;
                const keyGen = require("../util/key.js");

                await users.updateOne({ user: user.id }, {
                    $push: {
                        boosts: Array.from({ length: count }).map(() => {
                            const _id = keyGen(10);
                            const _time = 1000 * 60 * 60 * 24 * 30;

                            return {
                                id: _id,
                                expires_at: Date.now() + _time
                            };
                        })
                    }
                });

                await interaction.reply({ 
                    embeds: [
                        new MessageEmbed()
                            .setColor("#ea822d")
                            .setDescription(":ballot_box_with_check: **|** A user named **" + user.username + "** was given **" + count + " boosts** for **1** month**!**")
                    ]
                });
                break;
            case "remove":
                const id = interaction.options["_hoistedOptions"].find(_o => _o.type == "STRING").value;
                if (!(boostCheck.boosts || []).find(_b => _b.id == id)) return await interaction.reply({ embeds: [ _noBoost ], ephemeral: true });
                const boostedGuild = await boosts.find({ "boosts.id": id });

                if (boostedGuild.length > 0) {
                    await boosts.updateOne({ guild: boostedGuild[0].guild }, {
                        boosts: (boostedGuild[0].boosts || []).filter(_g => _g.id != id)
                    });
                };

                await users.updateOne({ user: user.id }, {
                    boosts: (boostCheck.boosts || []).filter(_b => _b.id != id)
                });

                await interaction.reply({ 
                    embeds: [
                        new MessageEmbed()
                            .setColor("#ea822d")
                            .setDescription(":ballot_box_with_check: **|** Successfully removed boost from " + user.username + "**!**")
                    ]
                });
                break;
            default:
                await interaction.reply({ 
                    embeds: [
                        new MessageEmbed()
                            .setColor("#ea822d")
                            .setDescription(":x: **|** Unknown command**!**")
                    ], 
                    ephemeral: true 
                });
                break;
        };
    }
};