const { model } = require("mongoose");
const {bcrypt} = require("bcrypt");
const { path } = require("../app");
const Chat = require("../models/Chat");
const User = require("../models/User");
const { logDebugMsg } = require("../utils/logger");
const { populate } = require("dotenv");
require("dotenv").config({ path: "../config/.env" });

exports.getUserDocById = async (userId) => {
  const user = await User.findById(userId)
    .populate({
      path: "contacts",
      model: User,
      select: "_id username profilePicture status",
    })
    .populate({
      path: "chats",
      model: Chat,
      populate: [
        {
          path: "participants",
          model: User,
          select: "_id username profilePicture",
        },
        {
          path: "lastMessage",
          model: "Message",
          populate: {
            path: "author",
            model: User,
            select: "_id username",
          },
        },
      ],
    });

  logDebugMsg(`getUserDocById: userId: ${userId}, user: ${user}`);
  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

exports.uploadProfilePicture = async (userId, file) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (!file || !file.path) {
    throw new Error("File not provided or invalid");
  }

  // Update the user's profile picture URL
  user.profilePicture = `${file.filename}`;
  await user.save();

  logDebugMsg(`uploadProfilePicture: userId: ${userId}, profilePicture: ${user.profilePicture}`);

  // populate the user document exactly like in getUserDocById
  const updatedUser = await User.findById(userId).populate({
    path: "contacts",
    model: User,
    select: "_id username profilePicture status",
  })
  .populate({
    path: "chats",
    model: Chat,
    populate: [
      {
        path: "participants",
        model: User,
        select: "_id username profilePicture",
      },
      {
        path: "lastMessage",
        model: "Message",
        populate: {
          path: "author",
          model: User,
          select: "_id username",
        },
      },
    ],
  });

  logDebugMsg(`uploadProfilePicture: updatedUser: ${updatedUser}`);

  if (!updatedUser) {
    throw new Error("Updated user not found");
  }

  return updatedUser;
};

exports.editUserProfile = async (userId, userData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const updatedFields = Object.keys(userData); // Fix this line

  updatedFields.forEach((field) => {
    if (userData[field] !== undefined) {
      user[field] = userData[field];
    }
  });

  await user.save();

  logDebugMsg(`editUserProfile: userId: ${userId}, updatedFields: ${updatedFields}`);

  // Populate the user document exactly like in getUserDocById
  const updatedUser = await User.findById(userId)
    .populate({
      path: "contacts",
      model: User,
      select: "_id username profilePicture status",
    })
    .populate({
      path: "chats",
      model: Chat,
      populate: [
        {
          path: "participants",
          model: User,
          select: "_id username profilePicture",
        },
        {
          path: "lastMessage",
          model: "Message",
          populate: {
            path: "author",
            model: User,
            select: "_id username",
          },
        },
      ],
    });

  logDebugMsg(`editUserProfile: updatedUser: ${updatedUser}`);

  if (!updatedUser) {
    throw new Error("Updated user not found");
  }

  return updatedUser;
};

exports.changeUserPassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Verify the old password
  const isMatch = await bcrypt.compare(oldPassword, user.hashed_password);

  if (!isMatch) {
    throw new Error("Old password is incorrect");
  }
  
  // Hash the new password
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  user.hashed_password = hashedNewPassword;
  await user.save();

  logDebugMsg(`changeUserPassword: userId: ${userId}, password changed successfully`);

  // Populate the user document exactly like in getUserDocById
  const updatedUser = await User.findById(userId)
  .populate({
    path: "contacts",
    model: User,
    select: "_id username profilePicture status",
  })
  .populate({
    path: "chats",
    model: Chat,
    populate: [
      {
        path: "participants",
        model: User,
        select: "_id username profilePicture",
      },
      {
        path: "lastMessage",
        model: "Message",
        populate: {
          path: "author",
          model: User,
          select: "_id username",
        },
      },
    ],
  });
    
  logDebugMsg(`changeUserPassword: updatedUser: ${updatedUser}`);

  if (!updatedUser) {
    throw new Error("Updated user not found");
  }

  return updatedUser;
}

exports.addContact = async (userId, contactId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Check if contact already exists in user's contacts
  if (user.contacts.includes(contactId)) {
    throw new Error("Contact already exists in user's contacts");
  }

  // Check if the contact exists in the database
  const contact = await User.findById(contactId);
  if (!contact) {
    throw new Error("Contact not found");
  }

  // Add contact to user's contacts
  user.contacts.push(contact._id);
  await user.save();

  logDebugMsg(`addContact: userId: ${userId}, contactId: ${contactId} added successfully`);

  // Populate the user document exactly like in getUserDocById
  const updatedUser = await User.findById(userId)
  .populate({
    path: "contacts",
    model: User,
    select: "_id username profilePicture status",
  })
  .populate({
    path: "chats",
    model: Chat,
    populate: [
      {
        path: "participants",
        model: User,
        select: "_id username profilePicture",
      },
      {
        path: "lastMessage",
        model: "Message",
        populate: {
          path: "author",
          model: User,
          select: "_id username",
        },
      },
    ],
  });

  logDebugMsg(`addContact: updatedUser: ${updatedUser}`);
  if (!updatedUser) {
    throw new Error("Updated user not found");
  }

  return updatedUser;
};


exports.deleteContact = async (userId, contactId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Check if contact exists in user's contacts
  if (!user.contacts.includes(contactId)) {
    throw new Error("Contact not found in user's contacts");
  }

  // Remove contact from user's contacts
  user.contacts = user.contacts.filter((contact) => contact.toString() !== contactId);

  await user.save();

  logDebugMsg(`deleteContact: userId: ${userId}, contactId: ${contactId} deleted successfully`);

  // Populate the user document exactly like in getUserDocById
  const updatedUser = await User.findById(userId)
  .populate({
    path: "contacts",
    model: User,
    select: "_id username profilePicture status",
  })
  .populate({
    path: "chats",
    model: Chat,
    populate: [
      {
        path: "participants",
        model: User,
        select: "_id username profilePicture",
      },
      {
        path: "lastMessage",
        model: "Message",
        populate: {
          path: "author",
          model: User,
          select: "_id username",
        },
      },
    ],
  });

  logDebugMsg(`deleteContact: updatedUser: ${updatedUser}`);

  if (!updatedUser) {
    throw new Error("Updated user not found");
  }

  return updatedUser;
};

exports.searchUsers = async (query) => {
  if (!query) {
    throw new Error("Search query is required");
  }

  // Use a regex to perform a case-insensitive search
  const regex = new RegExp(query, "i");

  const users = await User.find({
    $or: [
      { username: regex },
      { first_name: regex },
      { last_name: regex },
    ],
  })
  .select("_id username profilePicture status");

  logDebugMsg(`searchUsers: query: ${query}, found users: ${users}`);

  return users;
};