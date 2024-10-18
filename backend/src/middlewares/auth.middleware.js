const ApiErrors = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const jwt = require("jsonwebtoken");
const authMiddleware = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) throw new ApiErrors(401, "Token not found");
    const data = jwt.decode(accessToken, process.env.ACCESS_TOKEN_SECRET);
    if (!data) throw new ApiErrors(401, "Token is not valid");
    req.user = data;
    next();
  } catch (error) {
    console.log(error);
    return res
      .status(error.statusCode || 401)
      .json(
        new ApiResponse(
          error.statusCode || 401,
          error.message || "Token is not authorized",
          null
        )
      );
  }
};

module.exports = { authMiddleware };
