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

exports.getUserChats = async (userId) => {
  // Find the user by ID and populate the chats and lastMessage fields
  const user = await User.findById(userId).populate({path: "chats", populate: {path: "lastMessage", model: "Message"}});
  if (!user) {
    throw new Error("User not found");
  } 
  
  // Return the chats of the user
  return user.chats;
};

exports.getUserById = async (userId) => {
  // Find the user by ID and populate the username field
  const user = await User.findById(userId).select("username");
  if (!user) {
    throw new Error("User not found");
  }

  return user.username;
};