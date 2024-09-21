const { Schema, model } = require("mongoose");

const ContactSchema = new Schema({
  saversEmail: {
    type: String,
    required: true,
    ref: "User",
  },
  savedEmail: {
    type: String,
    required: true,
    ref: "User",
  },
});

const Contact = model("ContactSchema", ContactSchema);
module.exports = { Contact };
