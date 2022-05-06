const { model, Schema } = require("mongoose");

module.exports = model("logs", new Schema({
    guild: { type: String, required: true },
    type: { type: String, required: true },
    date: { type: String, required: true },
    data: { type: Object, required: true }
}));