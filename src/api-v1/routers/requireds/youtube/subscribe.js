const users = require("../../../../database/models/users.js");
const config = require("../../../../../award.config.js");
const fetch = require("node-superfetch");
const axios = require("axios");

module.exports = async (connections, user, giveaway, required, req, client) => {
    try {
        if (!connections["youtube"] || !connections["youtube"].id) return req.locale["requireds"]["youtube"]["connect_account"];
        let accessToken = connections["youtube"].accessToken;
        
        const _generateToken = async () => {
            const _getToken = await axios.post("https://www.googleapis.com/oauth2/v4/token", { 
                client_id: config.auth.youtube.id, 
                client_secret: config.auth.youtube.secret, 
                refresh_token: connections["youtube"].refreshToken, 
                grant_type: "refresh_token"
            }).catch(() => {});

            if (!_getToken || !_getToken.data || !_getToken.data.access_token) return false;
            await users.updateOne({ user: user.id }, { "youtube.accessToken": _getToken.data.access_token });
            accessToken = _getToken.data.access_token;
            return true;
        };

        const _checkToken = await axios.get("https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=" + accessToken).catch(() => {});
        if (!_checkToken || !_checkToken.data || !_checkToken.data.expires_in || _checkToken.data.expires_in < 600) {
            const _isGenerated = await _generateToken();
            if (_isGenerated != true) {
                await users.updateOne({ user: user.id }, { youtube: {} });
                return req.locale["requireds"]["youtube"]["terminated"];
            };
        };

        const _checkSub = await axios.get("https://www.googleapis.com/youtube/v3/subscriptions?part=id&channelId=" + connections["youtube"].id + "&forChannelId=" + required["id"] + "&key=" + config.auth.youtube.apiKey, {
            headers: {
                "Authorization": "Bearer " + accessToken
            }
        }).catch(() => {});

        if (_checkSub && _checkSub.data && _checkSub.data.items && Array.isArray(_checkSub.data.items) && _checkSub.data.items.length > 0) {
            return true;
        } else {
            if (connections["youtube"].id == required["id"]) {
                return true;
            } else {
                return req.locale["requireds"]["youtube"]["subscribe_channel"];
            };
        };
    } catch(err) {
        console.log(err);
        return req.locale["global"]["something_went_wrong"];
    };
};