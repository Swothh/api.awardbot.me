const users = require("../../../../database/models/users.js");
const config = require("../../../../../award.config.js");
const axios = require("axios");

module.exports = async (connections, user, giveaway, required, req, client) => {
    try {
        if (!connections["github"] || !connections["github"].id) return req.locale["requireds"]["github"]["connect_account"];
        let accessToken = connections["github"].accessToken;
        
        const _fetchFollow = await axios.get("https://api.github.com/user/following/" + required["username"], {
            headers: {
                "Authorization": "Bearer " + accessToken
            }
        }).catch(() => {});
        
        if (!_fetchFollow) {
            if (connections["github"].username != required["username"]) {
                return req.locale["requireds"]["github"]["follow_account"];
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