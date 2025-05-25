/**
 * Initializes the WebSocket server for real-time chat functionality.
 * 
 * @param {Object} server - The HTTP server instance to attach the WebSocket server to.
 * 
 * @description
 * This WebSocket server handles real-time communication for a chat application. 
 * It manages user connections, authenticates users via JWT tokens, and facilitates 
 * message broadcasting to relevant chat rooms. The server also updates the database 
 * with new messages and maintains the last message for each chat.
 * 
 * Key Features:
 * - Authenticates users using JWT tokens passed in the WebSocket connection URL.
 * - Automatically joins users to their respective chat rooms based on database records.
 * - Broadcasts messages to all users in the same chat room.
 * - Updates the last message in the chat document when a new message is sent.
 * - Tracks online users and their active chat rooms.
 * 
 * Events:
 * - `connection`: Triggered when a new client connects to the WebSocket server.
 * - `message`: Triggered when a client sends a message to the server.
 * - `close`: Triggered when a client disconnects from the WebSocket server.
 * - `upgrade`: Triggered when an HTTP request is upgraded to a WebSocket connection.
 * 
 * Frontend Team Notes:
 * - Ensure the WebSocket connection URL includes a valid JWT token as a query parameter (e.g., `ws://server-url?token=your-jwt-token`).
 * - Handle incoming messages of type `chatMessage` to display real-time chat updates.
 * - Implement additional message types (e.g., `typing`, `seen`) as needed for enhanced user experience.
 * - Be prepared to handle server-initiated messages for chat room updates and notifications.
 * 
 * Parameters Required from Frontend:
 * - WebSocket connection URL with a valid JWT token as a query parameter (e.g., `ws://server-url?token=your-jwt-token`).
 * - For sending a message:
 *   - `type`: The type of message (e.g., `chatMessage`).
 *   - `chatId`: The ID of the chat room where the message is being sent.
 *   - `message`: The content of the message.
 * 
 * Data Received by Frontend:
 * - For a new message:
 *   - `type`: The type of message (e.g., `chatMessage`).
 *   - `chatId`: The ID of the chat room where the message belongs.
 *   - `message`: The message object, including details like author and content.
 * - For server notifications:
 *   - `type`: Notification type (e.g., `message`).
 *   - `chatId`: The ID of the chat room related to the notification.
 *   - `message`: Notification content (e.g., "now you supposed to receive messages for [chatId]").
 */
const webSocket = require("ws");
const logger = require("../utils/logger");
const Message = require("../models/Message");
const User = require("../models/User");
const Chat = require("../models/Chat");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// TODO : when user connect to socket he join to all rooms he is in by the db
// TODO : when user disconnect from socket he leave all rooms he is in by the db
// TODO : update the last message in the chat document when a new message is sent

exports.initializeChatWebSocket = (server) => {
  const wss = new webSocket.Server({ noServer: true });

  const onlineUsers = new Map(); // Map to keep track of online users <WebSocket, Set<ChatId>>

  // Handle HTTP upgrade requests to WebSocket
  server.on("upgrade", (request, socket, head) => {
    console.log("SOCKET Upgrade request URL:", request.url);

    const url = request.url;
    if (!url || !url.includes("?") || !url.includes("=")) {
      console.error("SOCKET Invalid or missing URL in the request:", url);
      socket.destroy();
      return;
    }

    const token = url.split("?")[1].split("=")[1];
    if (!token) {
      console.error("SOCKET Token not found in the URL:", url);
      socket.destroy();
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("SOCKET Decoded token:", decoded);
      request.user = decoded; // Attach user info to request object
      wss.handleUpgrade(request, socket, head, (ws) => {
        ws.token = token; // Store the token in the WebSocket object
        console.log("SOCKET WebSocket connection established");
        wss.emit("connection", ws, request); // Emit the connection event to the WebSocket server
      });
    } catch (err) {
      console.error("SOCKET Token verification failed:", err);
      socket.destroy();
    }
  });

  wss.on("connection", async (ws) => {
    logger.logInfoMsg("SOCKET New client connected");
    onlineUsers.set(ws, new Set()); // Initialize a new set for the connected client

    try {
      const userId = jwt.verify(ws.token, process.env.JWT_SECRET).id;
      const chatsIds = await User.findById(userId).select("chats");

      console.log("SOCKET User's chat IDs:", chatsIds.chats);
      chatsIds.chats.forEach((chatId) => {
        // Add chatId as a string to the Set
        onlineUsers.get(ws).add(chatId.toString());
        console.log(`SOCKET ${userId} joined chat: ${chatId}`);
        ws.send(
          JSON.stringify({
            type: "message",
            chatId: chatId,
            message: `now you supposed to receive messages for ${chatId}`,
          })
        );

        console.log("SOCKET Online users and their chat IDs:");
        onlineUsers.forEach((chatIdSet, clientSocket) => {
          const clientUserId = jwt.verify(
            clientSocket.token,
            process.env.JWT_SECRET
          ).id;
          const chatIds = Array.from(chatIdSet);
          console.log(`SOCKET User ID: ${clientUserId}, Chat IDs: ${chatIds}`);
        });
      });

      ws.on("message", async (data) => {
        try {
          const { type, chatId, message } = JSON.parse(data);
          const chatIdObject = mongoose.Types.ObjectId.isValid(chatId)
            ? new mongoose.Types.ObjectId(chatId)
            : null;

          if (!chatIdObject) {
            logger.logErrorMsg(`SOCKET Invalid chatId: ${chatId}`);
            return;
          }

          logger.logInfoMsg(`SOCKET Received message: ${data}`);

          if (type === "chatMessage") {
            logger.logInfoMsg(`SOCKET Received message in chat ${chatId}: ${message}`);

            const authorId = jwt.verify(ws.token, process.env.JWT_SECRET).id;

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

            // Broadcast the new message to all connected clients in the same chat room
            onlineUsers.forEach((chatIdSet, clientSocket) => {
              console.log(`SOCKET chatIdSet contents: ${[...chatIdSet]}`);
              console.log(`SOCKET Checking if chatIdSet has chatId: ${chatId}`);
            
              if (chatIdSet.has(chatId)) {
                clientSocket.send(
                  JSON.stringify({
                    type: "chatMessage",
                    chatId: chatId,
                    message: populatedMessage,
                  })
                );
              }
            });

            await Chat.findByIdAndUpdate(
              { _id: chatId },
              { lastMessage: populatedMessage.content },
              { new: true }
            );
          }
          else if (type === "messageSeen") {}
          
        } catch (err) {
          console.error("SOCKET Error processing message:", err);
        }
      });

      ws.on("close", () => {
        logger.logInfoMsg("SOCKET Client disconnected");
        onlineUsers.delete(ws); // Clean up the map
      });
    } catch (err) {
      console.error("SOCKET Error during connection setup:", err);
    }
  });
};


/** DOCUMENTATION OF EVENTS
 * - `connection`: Emitted when a new client connects to the WebSocket server.
 * - `message`: Emitted when a message is received from a client.
 * - `close`: Emitted when a client disconnects from the WebSocket server.
 * - `error`: Emitted when an error occurs in the WebSocket server.
 * - `upgrade`: Emitted when an HTTP request is upgraded to a WebSocket connection.
 */