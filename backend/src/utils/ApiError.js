module.exports = class ApiErrors extends Error {
  constructor(
    statusCode = 401,
    message = "Something went wrong",
    data = null,
    success = false
  ) {
    super(message);
    this.statusCode = statusCode;
    this.success = success;
    this.data = data;
  }
};
