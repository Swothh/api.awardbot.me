const { model, Schema } = require("mongoose");
const createKey = require('../../util/key.js');

module.exports = model("giveaways", new Schema({
    id: { type: String, required: true, default: createKey() },
    guild: { type: String, required: true },
    channel: { type: String, required: true },
    message: { type: String, required: true },
    rerolled: { type: Number, required: true, default: 0 },
    status: { type: String, required: true, default: "CONTINUES" },
    private: { type: Boolean, required: true, default: false },
    banner: { type: String, required: true, default: "https://i.ibb.co/30DfCws/Varlk-9300x.png" },
    title: { type: String, required: true },
    prize: { type: String, required: true },
    description: { type: String, required: true },
    winners_count: { type: Number, required: true },
    duration: { type: Number, required: true },
    started_at: { type: Number, required: true },
    winners: { type: Array, required: true, default: [] },
    participants: { type: Array, default: [] },
    requireds: { type: Array, required: true, default: [] },
    auto_rewards: { type: Array, required: false, default: [] },
    pinActive: { type: Boolean, required: false, default: false },
    pin: { type: Number, maxLength: 6, required: false, default: null }
}));