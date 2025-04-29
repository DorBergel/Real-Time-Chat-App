const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "../config/.env" });
const Message = require("../models/Message");
const User = require("../models/User");
const { path } = require("../app");

exports.getChatMessages = async (chatId) => {
    
    // sorted by createdAt in ascending order
    const messages = await Message.find({chat: chatId}).sort({createdAt: 1}).populate({path: 'author', model: User}).lean();
    if (!messages) {
        throw new Error("Messages not found");
    }

    return messages;
}