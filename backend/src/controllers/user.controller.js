const { produceInKakfa } = require("../kafka/producer");
const { Contact } = require("../models/contact.model");
const { Group } = require("../models/groups.models");
const User = require("../models/user.models");
const { redis } = require("../redis/redis");
const ApiErrors = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const cloudinary = require("../utils/cloudinary");

const test = async (req, res) => {
  try {
    return res.send("Hi");
  } catch (error) {}
};

// register controller

const signup = async (req, res) => {
  try {
    // take the username, mail and password
    // check the username and email are unique
    // if everything works good, take the password and avatar
    // hash the password

    const { username, email, password, firstname, lastname } = req.body;
    const file = req.file;

    if (
      [username, email, password, firstname, lastname].some(
        (field) => field === undefined
      )
    ) {
      throw new ApiErrors(401, "All fields are required");
    }
    const user = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (user) throw new ApiErrors(401, "Username or Email are already in Use");
    // const avatar = await cloudinary(req.file?.path);

    const newUser = await User.create({
      email,
      firstname,
      username,
      lastname,
      password,
      // avatar,
    });

    const createdUser = await User.findById(newUser._id).select(
      "-password -refreshToken"
    );
    if (!createdUser) throw new ApiErrors(401, "User not created.");

    //produce signup email to kafka

    console.log(req.file);
    if (req.file && req.file.path) {
      console.log("Avatar File is sent..");
      await produceInKakfa({
        topic: process.env.KAFKA_TOPIC,
        messages: [
          {
            key: createdUser._id.toString() + "-avatarset",
            value: JSON.stringify({
              user_id: createdUser._id,
              localpath: req.file.path,
            }),
            partition: process.env.KAFKA_CHAT_PARTITION_AVATAR_ID,
          },
          {
            key: createdUser._id.toString() + "-mailsend",
            value: JSON.stringify({
              from: process.env.SERVER_MAIL,
              to: email,
              html: `<p>Welcome ${username} to InChat.</p>`,
              subject: "Thanks for signing up in InChat.",
            }),
            partition: process.env.KAFKA_CHAT_PARTITION_MAIL_ID,
          },
          {
            key: createdUser._id.toString() + "-verifyusermail",
            value: JSON.stringify({
              from: process.env.SERVER_MAIL,
              to: email,
              subject: `<p>Verify ${username} to InChat.</p>`,
              html: `Click on this link to get verified. ${
                process.env.VERIFY_MAIL_ADDRESS
              }/${createdUser._id.toString()}`,
            }),
            partition: process.env.KAFKA_CHAT_VERIFY_MAIL_ID,
          },
        ],
      });
    } else {
      await produceInKakfa({
        topic: process.env.KAFKA_TOPIC,
        messages: [
          {
            key: createdUser._id.toString() + "-mailsend",
            value: JSON.stringify({
              from: process.env.SERVER_MAIL,
              to: email,
              html: `<p>Welcome ${username} to InChat.</p>`,
              subject: "Thanks for signing up in InChat.",
            }),
            partition: process.env.KAFKA_CHAT_PARTITION_MAIL_ID,
          },
        ],
      });
    }
    return res
      .status(201)
      .json(new ApiResponse(201, "User Created Successfully", createdUser));
  } catch (error) {
    console.log(error.message);
    return res
      .status(error.statusCode || 401)
      .json(
        new ApiResponse(
          error.statusCode || 401,
          error.message || "All fields are required",
          false
        )
      );
  }
};

const options = {
  secure: process.env.NODE_ENV === "development" ? false : true,
  httpOnly: true,
  samesite: "None",
  maxAge: 5 * 24 * 60 * 60 * 1000, // 5 * 24 hours in milliseconds
};

const generateToken = async (user) => {
  try {
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({
      validateBeforeSave: false,
    });
    return [accessToken, refreshToken];
  } catch (error) {
    console.log(error);
    return [null, null];
  }
};
const login = async (req, res) => {
  try {
    const { uservalue, password } = req.body;
    if (!uservalue) throw new ApiErrors(401, "Credentials doesnot match");
    const user = await User.findOne({
      $or: [{ email: uservalue }, { username: uservalue }],
    });
    if (!user) throw new ApiErrors(401, "Credentials doesnot match");
    if (!user.isVerified) throw new ApiErrors(401, "User is not verified");
    const isPasswordCorrect = await user.checkPassword(password);
    if (!isPasswordCorrect)
      throw new ApiErrors(401, "Credentials doesnot match");
    const [accessToken, refreshToken] = await generateToken(user);
    if (!accessToken && !refreshToken)
      throw new ApiErrors(401, "Tokens Are not Created");
    await redis.setValue({
      key: user._id.toString(),
      value: JSON.stringify({
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
      }),
      expiryInMinutes: 30,
    });

    return res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(201, "User found", {
          username: user.username,
          firstname: user.firstname,
          lastname: user.lastname,
          id: user._id,
          avatar: user.avatar,
          isVerified: user.isVerified,
          isAdmin: user.isAdmin,
          email: user.email,
        })
      );
  } catch (error) {
    console.log(error);
    return res
      .status(error.statusCode || 401)
      .json(
        new ApiResponse(
          error.statusCode || 401,
          error.message || "Error while logging user in"
        )
      );
  }
};

const verify = async (req, res) => {
  try {
    const user_id = req.params.id;
    const user = await User.findById(user_id);
    if (!user) throw new ApiErrors(401, "User does not exists");
    user.isVerified = true;
    await user.save({ validateBeforeSave: false });
    await produceInKakfa({
      topic: process.env.KAFKA_TOPIC,
      messages: [
        {
          key: `${user._id.toString()}-verified-mail`,
          value: JSON.stringify({
            from: process.env.SERVER_MAIL,
            to: user.email,
            html: `<p>${user.username} is now verified to InChat.</p>`,
            subject: "Thanks for verifying in InChat.",
          }),
          partition: process.env.KAFKA_CHAT_VERIFY_MAIL_ID,
        },
      ],
    });
    return res.status(201).json(new ApiResponse(401, "User is verified", true));
  } catch (error) {
    return res
      .status(error.statusCode || 401)
      .json(
        new ApiResponse(
          error.statusCode || 401,
          error.message || "User could not be verified."
        )
      );
  }
};

const logout = async (req, res) => {
  try {
    const userData = req.user;
    const user = await User.findById(userData._id);
    user.refreshToken = "";
    await user.save({
      validateBeforeSave: false,
    });
    return res
      .status(201)
      .cookie("accessToken", "")
      .cookie("refreshToken", "")
      .json(new ApiResponse(201, "User Logged Out", true));
  } catch (error) {
    return res
      .status(error.statusCode || 401)
      .json(
        new ApiResponse(
          error.statusCode || 401,
          error.message || "Token not authorized",
          null
        )
      );
  }
};

const getUserInfo = async (req, res) => {
  try {
    const user_id = req.user._id;
    const user = await User.findById(user_id).select("-password -refreshToken");
    if (!user) throw new ApiErrors(401, "User Not found");
    return res.status(201).json(new ApiResponse(201, "User Found", user));
  } catch (error) {
    console.log(error);
    return res
      .status(error.statusCode || 401)
      .json(
        new ApiResponse(error.statusCode || 401, error.message || "User Found")
      );
  }
};

const saveContact = async (req, res) => {
  try {
    const { others_email, user_email } = req.body;
    if (
      [others_email, user_email].some(
        (field) => field === undefined || field.trim() === ""
      )
    )
      throw new ApiErrors(401, "All fields are required");

    if (others_email === user_email) {
      throw new ApiErrors(401, "Cannot save own contact");
    }
    const findSavedContact = await Contact.findOne({
      $and: [{ saversEmail: user_email }, { savedEmail: others_email }],
    });

    if (findSavedContact) {
      throw new ApiErrors(401, "Contact already saved");
    }
    await Contact.create({
      saversEmail: user_email,
      savedEmail: others_email,
    });
    return res.status(201).json(new ApiResponse(201, "Contact Saved", true));
  } catch (error) {
    return res
      .status(error.statusCode || 401)
      .json(
        new ApiResponse(
          error.statusCode || 401,
          error.message || "Error While saving contact"
        )
      );
  }
};

const getAllContactsOfAuser = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) throw new ApiErrors(401, "User ID required.");
    let data;
    data = await redis.getValue(id);
    if (data) data = JSON.parse(data);

    if (!data) data = await User.findById(id);
    const contacts = await Contact.find({
      saversEmail: data.email,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, "Contact Found", contacts));
  } catch (error) {
    return res
      .status(error.statusCode || 401)
      .json(
        new ApiResponse(
          error.statusCode || 401,
          error.message || "Error While saving contact"
        )
      );
  }
};

const getUserDetailsFromEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) throw new ApiErrors(401, "Email required to get info");
    const user = await User.findOne({ email }).select(
      "-password -refreshToken -isAdmin -isVerified"
    );
    return res.status(201).json(new ApiResponse(201, "User Found", user));
  } catch (error) {
    return res
      .status(error.statusCode || 401)
      .json(
        new ApiResponse(
          error.statusCode || 401,
          error.message || "Error While saving contact"
        )
      );
  }
};
const getUserDetailsFromUsername = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) throw new ApiErrors(401, "Email required to get info");
    const user = await User.findOne({ username }).select(
      "-password -refreshToken -isAdmin -isVerified"
    );
    return res.status(201).json(new ApiResponse(201, "User Found", user));
  } catch (error) {
    return res
      .status(error.statusCode || 401)
      .json(
        new ApiResponse(
          error.statusCode || 401,
          error.message || "Error While saving contact"
        )
      );
  }
};

const checkUserOrGroup = async (req, res) => {
  try {
    const { name } = req.body;
    console.log(name);
    const user = await User.findOne({ username: name });
    if (user) {
      return res
        .status(201)
        .json(new ApiResponse(201, "It is username of a user", true));
    } else {
      return res
        .status(201)
        .json(new ApiResponse(201, "It is not a username of a user", false));
    }
  } catch (error) {
    return res
      .status(error.statusCode || 401)
      .json(
        new ApiResponse(
          error.statusCode || 401,
          error.message || "Error While saving contact"
        )
      );
  }
};

module.exports = {
  getUserDetailsFromUsername,
  getUserDetailsFromEmail,
  test,
  signup,
  login,
  logout,
  getUserInfo,
  verify,
  saveContact,
  getAllContactsOfAuser,
  checkUserOrGroup,
};
