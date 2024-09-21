const { Schema, model, Types } = require("mongoose");

const GroupInfoSchema = new Schema(
  {
    memberId: {
      type: Types.ObjectId,
      ref: "User",
    },
    groupname: {
      type: String,
      ref: "Group",
    },
    addedby: {
      type: Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const GroupInfo = model("GroupInfo", GroupInfoSchema);
module.exports = { GroupInfo };
