const { model, Schema } = require("mongoose");

module.exports = model("ig", new Schema({
    user: { type: String, required: true },
    username: { type: String, required: true },
    code: { type: String, required: true },
    verified: { type: Boolean, required: true, default: false }
}));