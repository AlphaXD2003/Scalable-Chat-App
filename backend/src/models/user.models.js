const { Schema, Types, model } = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserSchema = new Schema({
  firstname: {
    type: String,
    required: true,
    trim: true,
  },
  lastname: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    minLength: 4,
    unique: [true, "Username must be unique."],
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: [true, "Email must be unique."],
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },

  avatar: {
    type: String,
    default: "https://www.gravatar.com/avatar/",
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  isAdmin: {
    type: Boolean,
    default: false,
  },

  refreshToken: {
    type: String,
  },
});
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(
    this.password,
    Number(process.env.BCRYPT_SALT) || 10
  );
  next();
});

UserSchema.methods.checkPassword = async function (sentPassword) {
  try {
    return await bcrypt.compare(sentPassword, this.password);
  } catch (error) {
    return false;
  }
};

UserSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      firstname: this.firstname,
      lastname: this.lastname,
      username: this.username,
      avatar: this.avatar,
      isVerified: this.isVerified,
      isAdmin: this.isAdmin,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const User = model("User", UserSchema);
module.exports = User;
