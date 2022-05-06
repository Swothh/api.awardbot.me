const { model, Schema } = require("mongoose");

module.exports = model("guild_settings", new Schema({
    guild: { type: String, required: true },
    data: { type: Object, required: true, default: {} }
}));