const giveaways = require("../../../database/models/giveaways.js");
const config = require("../../../../award.config.js");
const { Permissions, MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu } = require("discord.js");
const express = require("express");
const router = express.Router();

module.exports = client => {
    router.post("/:id/edit", async (req, res) => {
        try {
            const _check = {
                title: "string", 
                prize: "string", 
                description: "string", 
                winners_count: "number", 
                duration: "number",
                banner: "string"
            };

            const _valideGiveaway = await giveaways.findOne({ id: req.params.id, status: "CONTINUES" });
            if (!_valideGiveaway) return res.json({ success: false, message: req.locale["giveaway"]["create"]["giveaway_not_found"], data: null });

            const _types = await Promise.all([
                Object.keys(req.body).filter(_item => _check[_item]).map(_item => {
                    switch(_check[_item]) {
                        case "string":
                            return typeof req.body[_item] == "string";
                            break;
                        case "number":
                            return !isNaN(req.body[_item]);
                            break;
                        default:
                            return false;
                            break;
                    };
                })
            ]);

            if (_types[0].filter(_valid => _valid !== true).length > 0) {
                const _notValid = Object.keys(req.body).filter(_item => _check[_item])[_types[0].indexOf(false)];
                return res.json({
                    success: false, 
                    message: "'" + _notValid + "' is must be a " + _check[_notValid] + "!", 
                    data: null
                });
            };

            const _checkGuild = await client.guilds.fetch(_valideGiveaway.guild).catch(() => {});
            if (!_checkGuild) return res.json({ success: false, message: req.locale["giveaway"]["create"]["not_found"], data: null });
            const _checkMember = await _checkGuild.members.fetch(req.user.id).catch(() => {});
            if (!_checkMember) return res.json({ success: false, message: req.locale["giveaway"]["create"]["user_not_found"], data: null });
            if (!_checkMember.permissions.has(Permissions.FLAGS[config.giveawayPerm])) return res.json({ success: false, message: req.locale["giveaway"]["create"]["access_denied"], data: null });
            if (req.body["winners_count"] && Number(req.body["winners_count"]) < 1) return res.json({ success: false, message: req.locale["giveaway"]["create"]["winners_min"], data: null });
            if (req.body["winners_count"] && Number(req.body["winners_count"]) > 10) return res.json({ success: false, message: req.locale["giveaway"]["create"]["winners_max"], data: null });
            if (req.body["duration"] && Number(req.body["duration"]) < 60000) return res.json({ success: false, message: req.locale["giveaway"]["create"]["duration_min"], data: null });
            if (req.body["duration"] && Number(req.body["duration"]) > 7776000000) return res.json({ success: false, message: req.locale["giveaway"]["create"]["duration_max"], data: null });

            await giveaways.updateOne({ id: req.params.id }, {
                title: req.body["title"] || _valideGiveaway.title,
                prize: req.body["prize"] || _valideGiveaway.prize,
                description: req.body["description"] || _valideGiveaway.description,
                winners_count: req.body["winners_count"] || _valideGiveaway.winners_count,
                duration: req.body["duration"] || _valideGiveaway.duration,
                /* title: req.body["banner"] || _valideGiveaway.banner */ /* sonra açılacak */
            });

            res.json({ 
                success: true, 
                message: req.locale["global"]["successful"], 
                data: true 
            });
        } catch(err) {
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });

    return router;
};