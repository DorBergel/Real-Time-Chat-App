require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("[] INFO - connected successfully to the database");
  } catch (error) {
    console.error("[] ERROR - database connection failed:", error);
    process.exit(1);
  }
};

module.exports = { connectDB };
