const webSocket = require("ws");
const logger = require("../utils/logger");
const Message = require("../models/Message");
const User = require("../models/User");
const Chat = require("../models/Chat");
const mongoose = require("mongoose");
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
      ws.send(
        JSON.stringify({
          type: "message",
          chatId: chatId,
          message: `now you supposed to receive messages for ${chatId}`,
        })
      );

      // log online users and their chat IDs in organized way
      console.log("Online users and their chat IDs:");
      onlineUsers.forEach((chatIdSet, clientSocket) => {
        const clientUserId = jwt.verify(
          clientSocket.token,
          process.env.JWT_SECRET
        ).id;
        const chatIds = Array.from(chatIdSet);
        console.log(`User ID: ${clientUserId}, Chat IDs: ${chatIds}`);
      });

      ws.on("message", async (data) => {
        const { type, chatId, message } = JSON.parse(data);
        const chatIdObject = mongoose.Types.ObjectId.isValid(chatId)
          ? mongoose.Types.ObjectId.createFromHexString(chatId)
          : null;

        if (!chatIdObject) {
          logger.logErrorMsg(`Invalid chatId: ${chatId}`);
          return;
        }

        logger.logInfoMsg(`Received message: ${data}`);

        if (type === "chatMessage") {
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
            // Check if the client is in the same chat by checking the set
            console.log("Client's chat IDs:", chatIdSet);
            console.log("Client's token:", clientSocket.token);
            console.log("Chat ID:", chatIdObject);
            console.log("chatIdsSet.has(chatId)", chatIdSet.has(chatIdObject));
            if (Array.from(chatIdSet).some((id) => id.equals(chatIdObject))) {
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
          await Chat.findByIdAndUpdate(
            { _id: chatId },
            { lastMessage: populatedMessage.content },
            { new: true }
          );
        }

        // TODO : handle other message types (e.g., typing, seen, etc.)
      });

      ws.on("close", async () => {
        logger.logInfoMsg("Client disconnected");
      });
    });
  });
};

/**
 


 */
