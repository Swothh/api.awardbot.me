const settings = require("../database/models/settings.js");
const config = require("../../award.config.js");

module.exports = async (user, locale) => {
    let app = await settings.findOne();
    if (!app) {
        await new settings().save();
        app = await settings.findOne();
    };

    if (user.banned == true) {
        if (!user.permissions.find(perm => perm == "*" || perm == "ANTI_BAN")) {
            return locale["global"]["you_are_banned"];
        };
    };

    if (app.maintenance_mode == true) {
        if (!user.permissions.find(perm => perm == "*" || perm == "MAINTENANCE_USER")) {
            return locale["global"]["maintenance_mode"];
        };
    };

    if (app.beta_mode == true) {
        if (!user.permissions.find(perm => perm == "*" || perm == "BETA_USER")) {
            return locale["global"]["beta_mode"];
        };
    };
};