const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "../config/.env" });
const Chat = require("../models/Chat");
const Message = require("../models/Message");

exports.getChat = async (chatId) => {
  // Check if the chat exists
  const chat = await Chat.findById(chatId)
  .populate({path: "lastMessage", model: Message});
  if (!chat) {
    throw new Error("Chat not found");
  }
  return chat;
};
