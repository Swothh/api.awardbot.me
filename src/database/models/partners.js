const { model, Schema } = require("mongoose");

module.exports = model("partners", new Schema({
    id: { type: String, required: true },
    banner: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    url: { type: Object, required: true }
}));