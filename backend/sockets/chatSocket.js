const webSocket = require("ws");
const logger = require("../utils/logger");
const Message = require("../models/Message");
const User = require("../models/User");
const Chat = require("../models/Chat");
const { model } = require("mongoose");
const jwt = require("jsonwebtoken");
const { path } = require("../app");
const { parse } = require("url");
const { log } = require("console");
const { on } = require("events");


// websocket flow:
// 1. client connect to server
// 2. client join a chat
// 3. client send message to server
// 4. server broadcast message to all clients in the same chat
// 5. client receive message from server
// 6. client update message list
// 7. client scroll to bottom of the message list


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
        console.log("WebSocket connection established");
        wss.emit("connection", ws, request); // Emit the connection event to the WebSocket server
      });
    }
    catch (err) {
      console.error("Token verification failed:", err);
      socket.destroy();
      return;
    }
  });
  wss.on("connection", (ws) => {
    logger.logInfoMsg("New client connected");
    onlineUsers.set(ws, new Set()); // Initialize a new set for the connected client
    
    ws.on("message", async (data) => {
      
      const { type, chatId, message } = JSON.parse(data);
      logger.logInfoMsg(`Received message: ${data}`);
      if (type === "join") {
        logger.logInfoMsg(`Client want to join chat: ${chatId}`);

        // Add the chatId to the set of online users
        onlineUsers.get()
      }
      else if (type === "message") {

        logger.logInfoMsg(`Received message in chat ${chatId}: ${message}`);
      }
    });

    ws.on("close", async () => {
      logger.logInfoMsg("Client disconnected");

      // Update lastMessage in the Chat model populated with the last message content
      
    });
  });
};

/**
 


 */