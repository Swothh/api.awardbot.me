const { model, Schema } = require("mongoose");

module.exports = model("users", new Schema({
    user: { type: String, required: true },
    banned: { type: Boolean, required: true, default: false },
    boosts: { type: Array, required: false, default: [] },
    token: { type: String, required: true },
    profile: { type: Object, required: true },
    refreshed_at: { type: Object, required: true },
    permissions: { type: Array, required: false, default: [] },
    notifications: { type: Array, required: false, default: [] },
    youtube: { type: Object, required: false },
    github: { type: Object, required: false },
    instagram: { type: Object, required: false },
    twitter: { type: Object, required: false },
    twitch: { type: Object, required: false },
    tiktok: { type: Object, required: false },
    telegram: { type: Object, required: false }
}));