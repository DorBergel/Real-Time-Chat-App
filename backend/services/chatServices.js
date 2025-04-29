const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "../config/.env" });
const Chat = require("../models/Chat");

exports.getChat = async (chatId) => {
  // Check if the chat exists
  const chat = await Chat.findById(chatId).lean();
  if (!chat) {
    throw new Error("Chat not found");
  }
  return chat;
};
