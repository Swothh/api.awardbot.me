const { model, Schema } = require("mongoose");

module.exports = model("boosts", new Schema({
    guild: { type: String, required: true },
    boosts: { type: Array, required: true, default: [] }
}));