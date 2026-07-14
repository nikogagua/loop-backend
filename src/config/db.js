const mongoose = require("mongoose");
const mongoDbConectionString = process.env.MONGODB_URI;

const connectDb = async () => {
  try {
    await mongoose.connect(mongoDbConectionString);
    console.log("MongoDB connected successfully 🚀");
  } catch (err) {
    console.log("MongoDB connection failed ❌", err);
    process.exit(1);
  }
};

module.exports = connectDb;
