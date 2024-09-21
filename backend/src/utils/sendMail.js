const nodemailer = require("nodemailer");
const transportObject = {
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SERVER_MAIL,
    pass: process.env.SERVER_MAIL_PASS,
  },
};

const transporter = nodemailer.createTransport(transportObject);
module.exports = { transporter };
