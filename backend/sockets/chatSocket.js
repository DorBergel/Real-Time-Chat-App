const webSocket = require("ws");
const logger = require("../utils/logger");
const Message = require("../models/Message");
const User = require("../models/User");
const Chat = require("../models/Chat");
const { model, default: mongoose } = require("mongoose");
const jwt = require("jsonwebtoken");
const { path } = require("../app");
const { parse } = require("url");
const { log } = require("console");
const { on } = require("events");
const e = require("express");

// TODO : when user connect to socket he join to all rooms he is in by the db
// TODO : when user disconnect from socket he leave all rooms he is in by the db
// TODO : update the last message in the chat document when a new message is sent


exports.initializeChatWebSocket = (server) => {
  const wss = new webSocket.Server({ noServer: true });

  const onlineUsers = new Map(); // Map to keep track of online users <WebSocket, Set<ChatId>>

  server.on("upgrade", (request, socket, head) => {
    console.log("Upgrade request URL:", request.url);

    const token = request.url.toString().split("?")[1].split("=")[1];

    console.log("Token from query:", token);

    if (!token) {
      console.error("Token missing in WebSocket request");
      socket.destroy();
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded);
      request.user = decoded; // Attach user info to request object
      wss.handleUpgrade(request, socket, head, (ws) => {
        ws.token = token; // Store the token in the WebSocket object
        console.log("WebSocket connection established");
        wss.emit("connection", ws, request); // Emit the connection event to the WebSocket server
      });
    } catch (err) {
      console.error("Token verification failed:", err);
      socket.destroy();
      return;
    }
  });

  wss.on("connection", async (ws) => {
    logger.logInfoMsg("New client connected");
    onlineUsers.set(ws, new Set()); // Initialize a new set for the connected client

    // TODO : when user connect to socket he join to all rooms he is in by the db
    // TODO : when user disconnect from socket he leave all rooms he is in by the db

    const userId = jwt.verify(ws.token, process.env.JWT_SECRET).id;
    const chatsIds = await User.findById(userId).select("chats");

    console.log("User's chat IDs:", chatsIds.chats);
    chatsIds.chats.forEach(async (chatId) => {
      onlineUsers.get(ws).add(chatId); // Add the chatId to the set of online users
      console.log(`${userId} joined chat: ${chatId}`);  

    ws.on("message", async (data) => {

      const { type, chatId, message } = JSON.parse(data);
      logger.logInfoMsg(`Received message: ${data}`);

      if (type === "join") { // TODO : consider using a different event name for joining a chat
        logger.logInfoMsg(`Client wants to join chat: ${chatId}`);
        
        // Add the chatId to the set of online users
        if (onlineUsers.has(ws)) {
          onlineUsers.get(ws).add(chatId);
        } else {
          onlineUsers.set(ws, new Set([chatId]));
        }
        logger.logInfoMsg(`Client joined chat: ${chatId}`);
      }
      
      else if (type === "chatMessage") {
        logger.logInfoMsg(`Received message in chat ${chatId}: ${message}`);

        // Use the token stored in the WebSocket object
        const authorId = jwt.verify(ws.token, process.env.JWT_SECRET).id;

        // Create a new message in the database
        const newMessage = await Message.create({
          author: authorId,
          chat: chatId,
          content: message,
        });

        const populatedMessage = await newMessage.populate({
          path: "author",
          select: "username",
          model: User,
        });

        // Broadcast the message to all online users in the app
        onlineUsers.forEach((chatIdSet, clientSocket) => {
          if (chatIdSet.has(chatId)) { // Check if the client is in the same chat by checking the set
            logger.logInfoMsg(`Sending message to ws: ${clientSocket}`);
            logger.logInfoMsg(`Sending message to chat: ${chatId}`);
            clientSocket.send(
              JSON.stringify({
                type: "chatMessage",
                chatId: chatId,
                message: populatedMessage,
              })
            );
          }
        });

        // Update the last message in the chat document
        await Chat.findByIdAndUpdate({_id: chatId}, {lastMessage: populatedMessage.content}, {new: true});

      } 
      

      // TODO : handle other message types (e.g., typing, seen, etc.)
    });

    ws.on("close", async () => {
      logger.logInfoMsg("Client disconnected");

      
      
    });
  });
})};

/**
 


 */