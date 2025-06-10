const { path } = require("../app");
const Chat = require("../models/Chat");
const User = require("../models/User");
const { logDebugMsg } = require("../utils/logger");
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

exports.addContact = async (userId, contactUsername) => {
  
  // Find the user by ID
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Find the contact by username
  const contact = await User.findOne({ username: contactUsername });
  if (!contact) {
    throw new Error("Contact not found");
  }

  // Check if the contact is already in the user's contacts
  if (user.contacts.includes(contact._id)) {
    throw new Error("Contact already exists in your contacts");
  }

  // Add the contact to the user's contacts
  user.contacts.push(contact._id);
  await user.save();

  // Populate the contacts field to return the updated contacts list
  const returnValue = await User.findById(userId).populate("contacts");

  logDebugMsg(`User ${userId} added contact ${contactUsername}`);
  logDebugMsg(`Updated contacts: ${returnValue}`);

  // Return the updated contacts list
  return returnValue.contacts;
}

exports.createChat = async (userId, contactId) => {
  // Find the user by ID and populate the chats and participants fields
  const user = await User.findById(userId).populate({
    path: "chats",
    populate: { path: "participants", model: "User" }
  });
  if (!user) {
    throw new Error("User not found");
  }

  // Find the contact by ID
  const contact = await User.findById(contactId);
  if (!contact) {
    throw new Error("Contact not found");
  }

  console.log(`user: ${user}`);
  console.log(`contact: ${contact}`);

  // Check if the chat already exists
  const existingChat = user.chats.find(chat => 
    chat.participants &&
    chat.participants.some(participant => participant._id.equals(contact._id)) &&
    chat.participants.some(participant => participant._id.equals(user._id))
  );
  if (existingChat) {
    throw new Error("Chat already exists with this contact");
  }

  // Create a new chat
  const newChat = new Chat({
    participants: [user._id, contact._id],
    title: contact.username,
  });

  // Save the new chat
  await newChat.save();

  // Add the new chat to both users' chats
  user.chats.push(newChat._id);
  contact.chats.push(newChat._id);

  await user.save();
  await contact.save();

  // Populate the new chat with the last message and participants
  const populatedChat = await Chat.findById(newChat._id)
    .populate({ path: "lastMessage", model: "Message" })
    .populate({ path: "participants", model: "User" });

    return populatedChat;
};

exports.getUserDocById = async (userId) => {
  // Find the user by ID and return the user document
  const user = await User.findById(userId).populate({
    path: "chats",
    populate: { path: "lastMessage", model: "Message" }
  }).populate("contacts");
  logDebugMsg(`getUserDocById: userId: ${userId}, user: ${user}`);
  if (!user) {
    throw new Error("User not found");
  }

  return user;
};