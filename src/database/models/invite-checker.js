const { model, Schema } = require("mongoose");

module.exports = model(
  "invites",
  new Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    invites: { type: Object, required: true },
  })
);
