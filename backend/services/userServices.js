const User = require("../models/User");
require("dotenv").config({ path: "../config/.env" });

exports.getUserContacts = async (userId) => {
  // Find the user by ID and populate the contacts field
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  contacts = await User.find({ _id: { $in: user.contacts } }).populate(
    "contacts"
  );

  // Return the contacts of the user
  return contacts;
};
