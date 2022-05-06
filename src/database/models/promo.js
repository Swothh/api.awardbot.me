const { model, Schema } = require("mongoose");

module.exports = model("promo", new Schema({
    id: { type: String, required: true },
    created_by: { type: String, required: true },
    code: { type: String, required: true },
    boost_count: { type: Number, required: true },
    expires_at: { type: String, required: true },
    uses: { type: Number, required: true },
    used_by: { type: Array, required: true, default: [] },
}));