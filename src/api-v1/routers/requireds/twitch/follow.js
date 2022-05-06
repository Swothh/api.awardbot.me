const users = require("../../../../database/models/users.js");
const config = require("../../../../../award.config.js");
const axios = require("axios");

module.exports = async (connections, user, giveaway, required, req, client) => {
    try {
        if (!connections["twitch"] || !connections["twitch"].id) return req.locale["requireds"]["twitch"]["connect_account"];
        let accessToken = connections["twitch"].accessToken;
        
        const _fetchFollow = await axios.get("https://api.twitch.tv/helix/users/follows?from_id=" + connections["twitch"].id + "&to_id=" + required["id"], {
            headers: {
                "Authorization": "Bearer " + accessToken,
                "Client-ID": "ljqmf68bo8u53bsoyl9fcw0rwv124z"
            }
        }).catch(() => {});
    
        if (!_fetchFollow || !_fetchFollow.data || !_fetchFollow.data.data || !_fetchFollow.data.data.length || _fetchFollow.data.data.length < 1) {
            if (connections["twitch"].id != required["id"]) {
                return req.locale["requireds"]["twitch"]["follow_account"];
            } else {
                return true;
            };
        } else {
            return true;
        };
    } catch(err) {
        console.log(err);
        return req.locale["global"]["something_went_wrong"];
    };
};