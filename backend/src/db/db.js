const mongoose = require("mongoose");

const connectDB = async () => {
  const instantce = await mongoose.connect(
    `${process.env.MONGODB_URL}/${process.env.DATABASE_NAME}`
  );
};

module.exports = connectDB;
