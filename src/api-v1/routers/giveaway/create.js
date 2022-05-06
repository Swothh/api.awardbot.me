const giveaways = require("../../../database/models/giveaways.js");
const config = require("../../../../award.config.js");
const { Permissions, MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu } = require("discord.js");
const createKey = require("../../../util/key.js");
const express = require("express");
const benefits = require("../../../util/benefits.js");
const router = express.Router();

module.exports = (client, wsSend) => {
    router.post("/create", async (req, res) => {
        try {
            const _check = { auto_rewards: "array", private: "boolean", guild: "string", channel: "string", title: "string", prize: "string", description: "string", winners_count: "number", duration: "number", requireds: "array" };
            if (Object.keys(_check).some(_item => typeof req.body[_item] == "undefined")) return res.json({ success: false, message: "No '" + Object.keys(_check).filter(_item => !req.body[_item]).join(", ") + "' provided in data!", data: null });

            const _types = await Promise.all([
                Object.keys(_check).map(_item => {
                    switch(_check[_item]) {
                        case "string":
                            return typeof req.body[_item] == "string";
                            break;
                        case "number":
                            return !isNaN(req.body[_item]);
                            break;
                        case "array":
                            return Array.isArray(req.body[_item]);
                            break;
                        case "boolean":
                            return typeof req.body[_item] == "boolean";
                            break;
                        default:
                            return false;
                            break;
                    };
                })
            ]);

            if (_types[0].filter(_valid => _valid !== true).length > 0) {
                const _notValid = Object.keys(_check)[_types[0].indexOf(false)];
                return res.json({
                    success: false, 
                    message: req.locale["giveaway"]["create"]["specify"]
                        .split("{PARAM}").join(_notValid.split("_").join(" ")),
                    data: null
                });
            };

            if (req.body["banner"] && typeof req.body["banner"] !== "string") return res.json({ success: false, message: "'banner' must be a string!", data: null });
            const _checkGuild = await client.guilds.fetch(req.body["guild"]).catch(() => {});
            if (!_checkGuild) return res.json({ success: false, message: req.locale["giveaway"]["create"]["not_found"], data: null });
            const _checkMember = await _checkGuild.members.fetch(req.user.id).catch(() => {});
            if (!_checkMember) return res.json({ success: false, message: req.locale["giveaway"]["create"]["user_not_found"], data: null });
            if (!_checkMember.permissions.has(Permissions.FLAGS[config.giveawayPerm])) return res.json({ success: false, message: req.locale["giveaway"]["create"]["access_denied"], data: null });
            const _checkChannel = await _checkGuild.channels.fetch(req.body["channel"]).catch(() => {});
            if (!_checkChannel) return res.json({ success: false, message: req.locale["giveaway"]["create"]["channel_not_found"], data: null });
            if (_checkChannel.type !== "GUILD_TEXT") return res.json({ success: false, message: req.locale["giveaway"]["create"]["channel_type"], data: null });
            if (Number(req.body["winners_count"]) < 1) return res.json({ success: false, message: req.locale["giveaway"]["create"]["winners_min"], data: null });
            if (Number(req.body["winners_count"]) > 10) return res.json({ success: false, message: req.locale["giveaway"]["create"]["winners_max"], data: null });
            if (Number(req.body["duration"]) < 60000) return res.json({ success: false, message: req.locale["giveaway"]["create"]["duration_min"], data: null });
            if (Number(req.body["duration"]) > 7776000000) return res.json({ success: false, message: req.locale["giveaway"]["create"]["duration_max"], data: null });
            if (req.body["title"].length > 30 || req.body["prize"].length > 30 || req.body["description"].length > 250) return res.json({ success: false, message: req.locale["giveaway"]["create"]["max_length"], data: null });
            const _checkLimit = await giveaways.find({ guild: req.body["guild"], status: "CONTINUES" });
            const _benefits = await benefits(_checkGuild.id);
            if (_checkLimit.length >= (_benefits.includes("giveaway_limit_t3") ? config.giveawayLimit[3] : (_benefits.includes("giveaway_limit_t2") ? config.giveawayLimit[2] : (_benefits.includes("giveaway_limit_t1") ? config.giveawayLimit[1] : config.giveawayLimit[0])))) return res.json({ success: false, message: req.locale["giveaway"]["create"]["limit"], data: null });

            if (req.body["requireds"].find(_item => 
                !_item.provider || 
                !_item.type
            )) return res.json({ success: false, message: "Invalid 'requireds' provided in data!", data: null });

            req.body["requireds"] = req.body["requireds"].map(_required => (
                {
                    provider: _required.provider,
                    type: _required.type.split(" ").join("_")
                }
            ));

            const _checkInvalids = await Promise.all([
                req.body["requireds"].map(_item => {
                    if (!Object.keys(config.requireds).includes(_item.provider)) return 'INVALID';
                    if (!config.requireds[_item.provider].types.map(_r => _r.name.split(" ").join("_")).includes(_item.type)) return 'INVALID';
                    if (!req._user[_item.provider == "discord" ? "profile" : _item.provider]) return 'NOT_LINKED';
                    return true;
                })
            ]);

            if (_checkInvalids[0].filter(_valid => _valid !== true).length > 0) {
                return res.json({ 
                    success: false, 
                    message: _checkInvalids[0].filter(_valid => _valid !== true)[0] == "INVALID" ?
                        "Invalid 'requireds' provided in data!" :
                        req.locale["giveaway"]["create"]["connect_account"],
                    data: null
                });
            };

            const _giveawayID = createKey();
            let _inviteURL;
            let _inviteLimit;
            let _role;
            let _Pin;
            
            if (req.body["requireds"].find(item => item.provider == "discord" && item.type == "join_server")) {
                try {
                    const invite = await _checkChannel.createInvite({ maxAge: 0, maxUses: 0 });
                    _inviteURL = invite.code;
                } catch(invErr) {
                    console.log(invErr);
                    return res.json({
                        success: false,
                        message: req.locale["global"]["something_went_wrong"],
                        data: null
                    });
                };
            };
            if (req.body["pin"]) {
                try {
                    _Pin = req.body["pin"];
                } catch(passwordErr) {
                    console.log(passwordErr);
                    return res.json({
                        success: false,
                        message: req.locale["global"]["something_went_wrong"],
                        data: null
                    });
                };
            };
            if (req.body["requireds"].find(item => item.provider == "discord" && item.type == "check_role")) {
                try {
                    if(!req.body['roleId']) return res.json({
                        success: false,
                        message: req.locale["requireds"]["discord"]["select_role"],
                        data: null
                    });
                    const role = await _checkGuild.roles.cache.get(req.body['roleId'])
                    _role = role;
                } catch(roleErr) {
                    console.log(roleErr);
                    return res.json({
                        success: false,
                        message: req.locale["global"]["something_went_wrong"],
                        data: null
                    });
                };
            };

            if (req.body["requireds"].find(item => item.provider == "discord" && item.type == "invite_checker")) {
                try {
                    if(!req.body['invite_limit']) return res.json({
                        success: false,
                        message: req.locale["requireds"]["discord"]["select_invite"],
                        data: null
                    });

                 if (!_checkGuild.me.permissions.has(Permissions.FLAGS[config.giveawayPerm])) return res.json({
                    success: false,
                    message: req.locale["giveaway"]["create"]["invite_per"],
                    data: null
                });
                    _inviteLimit = req.body['invite_limit']
                } catch(inviteErr) {
                    console.log(inviteErr);
                    return res.json({
                        success: false,
                        message: req.locale["global"]["something_went_wrong"],
                        data: null
                    });
                };
            };

            const _components = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setLabel('Join on Website')
                        .setEmoji('🌐')
                        .setURL(config.website.protocol + '://' + config.website.domain + '/g/' + _giveawayID)
                        .setStyle('LINK'))
                .addComponents(
                    new MessageButton()
                        .setLabel('Join on Discord')
                        .setEmoji('🎉')
                        .setCustomId('join-'+ _giveawayID)
                        .setStyle('SECONDARY'));
                
            const _message = await _checkChannel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle(req.body["title"])
                        .setColor('#ea822d')
                        .addField('**__Overview__**', `Ends at: <t:${Math.floor((Date.now() + Number(req.body["duration"])) / 1000)}> \nPrize: \`\`${req.body["prize"].split("`").join("")}\`\` \nHosted by: <@${req.user.id}> \nWinners: \`\`${req.body["winners_count"]}\`\``)
                        .addField('**__Requirements__**', req.body["requireds"].length == 0 ? "No requirements." : req.body["requireds"].map(_required => {
                            return `${config["requireds"][_required.provider]["emoji"]} ${_required.provider == "discord" ? (_required.type === 'check_role' ? '<@&'+_role.id+'>' : 'Discord') : req._user[_required.provider]["name"] || req._user[_required.provider]["username"]} \`\`(${_required.type.split("_").map(_itm => { return _itm.charAt(0).toUpperCase() + _itm.slice(1) }).join(" ")})\`\``;
                        }).join(" \n"))
                ],
                components: [ _components ]
            }).catch(() => {
                res.json({ 
                    success: false, 
                    message: req.locale["giveaway"]["create"]["no_access"], 
                    data: null 
                });
            });

            if (_message) {
                await new giveaways({
                    id: _giveawayID,
                    guild: req.body["guild"],
                    private: req.body["private"],
                    channel: req.body["channel"],
                    message: _message.id,
                    /* banner: req.body["banner"], */ /* sonra açılacak */
                    title: req.body["title"],
                    prize: req.body["prize"],
                    description: req.body["description"],
                    winners_count: req.body["winners_count"],
                    duration: req.body["duration"],
                    started_at: Date.now(),
                    auto_rewards: req.body["auto_rewards"],
                    pinActive: req.body["pinActive"],
                    pin: _Pin,
                    requireds: req.body["requireds"].map(_item => ({
                        provider: _item["provider"],
                        type: _item["type"],
                        displayType: _item["type"].split("_").map(_itm => _itm.charAt(0).toUpperCase() + _itm.slice(1)).join(" "),
                        id: _item["id"] || req._user[_item["provider"] == "discord" ? "profile" : _item["provider"]].id,
                        username: req._user[_item["provider"] == "discord" ? "profile" : _item["provider"]].username || null,
                        invite: _inviteURL || null,
                        roleId: _role?.id || null,
                        roleName: _role?.name || null,
                        invitelimit: _inviteLimit || null
                    }))
                }).save();
                const _giveaway = await giveaways.findOne({ id: _giveawayID }, { __v: 0, _id: 0 });
                wsSend({
                    name: "giveaway_create",
                    guild: _giveaway.guild,
                    data: {
                        user: req._publicProfile,
                        giveaway: _giveaway
                    }
                });
                res.json({ 
                    success: true, 
                    message: req.locale["global"]["successful"], 
                    data: true 
                });
            } else {
                try {
                    res.json({ 
                        success: false, 
                        message: req.locale["global"]["something_went_wrong"], 
                        data: null 
                    });
                } catch {};
            };
        } catch(err) {
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });

    return router;
};