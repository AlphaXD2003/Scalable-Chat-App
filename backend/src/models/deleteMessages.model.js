const { Schema, model, Types } = require("mongoose");

const DeleteMessageSchema = new Schema({
  messageId: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
  },
  to: {
    type: String,
    ref: "User",
  },
  from: {
    type: String,
    ref: "User",
  },
});

const DeleteMessage = model("DeleteMessage", DeleteMessageSchema);
module.exports = { DeleteMessage };
