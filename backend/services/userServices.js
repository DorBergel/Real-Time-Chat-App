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
