const { Schema, model, Types } = require("mongoose");

const GroupSchema = new Schema(
  {
    super: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
    },
    admin: [
      {
        type: Types.ObjectId,
        required: true,
        ref: "User",
      },
    ],
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
  },
  { timestamps: true }
);

const Group = model("Group", GroupSchema);

module.exports = { Group };
