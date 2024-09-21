const { Schema, model } = require("mongoose");

const ChatMessageSchema = new Schema(
  {
    uid: {
      type: String,
      unique: true,
      required: true,
    },
    roomId: {
      type: String,
      required: true,
    },
    sender: {
      type: String, // username
      required: true,
    },
    receiver: {
      type: String, // username
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "media"],
      default: "text",
    },
    delivered: {
      type: Boolean,
      default: false,
    },
    sendingTime: {
      type: Date,
    },
    roomType: {
      type: String,
      enum: ["private", "group"],
      default: "private",
    },
  },
  { timestamps: true }
);

const ChatMessageModel = model("chatmessage", ChatMessageSchema);
module.exports = { ChatMessageModel };
