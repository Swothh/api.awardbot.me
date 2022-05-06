const settings = require("../database/models/guild-settings");
const logs = require("../database/models/logs");
const { MessageEmbed, MessageAttachment } = require("discord.js");
const WebSocket = require("ws");

module.exports = (wss, client) => {
    return async options => {
        new logs({
            guild: options.guild,
            type: options.name,
            data: options.data,
            date: Date.now()
        }).save();

        try {
            const _settings = await settings.findOne({ guild: options.guild });
            if (_settings && _settings.data && _settings.data.log && _settings.data.log.enabled == true) {
                const channel = client.channels.cache.get(_settings.data.log.channel);
                if (channel) {
                    channel.send({ 
                        embeds: [
                            new MessageEmbed()
                                .setColor("#ea822d")
                                .setTitle("🤖 | Audit Log")
                                .setDescription("> Type**:** `" + options.name + "`\n> Date**:** <t:" + Math.floor(Date.now() / 1000) + "> \n\n:point_down: **|** *The action data is below.*")
                        ]
                    });

                    channel.send({ 
                        files: [
                            new MessageAttachment(Buffer.from(JSON.stringify(options.data, null, 2), "utf-8"), "award.json")
                        ]
                    });
                };
            };
        } catch {};

        return wss.clients.forEach(client => {
            if (client._user) return;
            if (!options.name || !options.guild || !options.data) throw new Error("Invalid usage!");
            if (client.readyState !== WebSocket.OPEN) return;
            if (client._guild !== options.guild) return;
            if (!client._intents.includes(options.name.toUpperCase())) return;
    
            client.send(JSON.stringify({
                type: options.name.toUpperCase(),
                message: null,
                data: options.data
            }));
        });
    };
};