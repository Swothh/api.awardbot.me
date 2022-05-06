const { model, Schema } = require("mongoose");

module.exports = model("settings", new Schema({
    beta_mode: { type: Boolean, required: true, default: false },
    maintenance_mode: { type: Boolean, required: true, default: false }
}));