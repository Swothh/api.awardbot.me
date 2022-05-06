module.exports = (length = 10) => {
    let charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        keyValue = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        keyValue += charset.charAt(Math.floor(Math.random() * n));
    }
    return keyValue;
};

module.exports.emoji = (length = 10) => {
    let charset = require("../../award.config.js").emojis,
        keyValue = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        keyValue += charset[Math.floor(Math.random() * n)];
    }
    return keyValue;
};