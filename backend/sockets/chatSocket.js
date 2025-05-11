require("dotenv").config();
const webSocket = require("ws");
const logger = require("../utils/logger");
const Message = require("../models/Message");
const User = require("../models/User");
const Chat = require("../models/Chat");
const { model } = require("mongoose");
const jwt = require("jsonwebtoken");
let lastMessage = null;

// websocket flow:
// 1. client connect to server
// 2. client join a chat
// 3. client send message to server
// 4. server broadcast message to all clients in the same chat
// 5. client receive message from server
// 6. client update message list
// 7. client scroll to bottom of the message list

exports.setUpWebSocket = (server) => {
  const wss = new webSocket.Server({ server });

  const onlineUsers = new Map(); // Map to store online users <userId, ws>
  const chatRooms = new Map(); // Map to store chat rooms <chatId, Set<ws>>
  let userId = null; // Variable to store the userId of the connected client

  wss.on("connection", (ws, req) => {
    logger.logInfoMsg("New client connected to main socket");

    // Extract token from query parameters
    const token = req.url.split("?token=")[1];
    console.log("Token:", token);

    try {
      userId = jwt.verify(token, process.env.JWT_SECRET).id;
      console.log("User ID:", userId);
      onlineUsers.set(userId, ws); // Store the userId in the onlineUsers map
    } catch (err) {
      console.error("Invalid token:", err.message);
      ws.close(); // Close the connection if the token is invalid
      return;
    }

    ws.on("message", async (data) => {
      const parsedData = JSON.parse(data);
      //const { type, chatId, message, userId } = parsedData;
      const { type, chatId, message } = parsedData;

      console.log("Parsed data:", parsedData);

      if (type === "join") {
        const chatId = message;
        logger.logInfoMsg(`Client joined chat: ${chatId}`);
        ws.currentChatId = chatId;
        if (!chatRooms.has(chatId)) {
          chatRooms.set(chatId, new Set());
        }
        chatRooms.get(chatId).add(ws);
        logger.logInfoMsg(`Client ${userId} joined chat: ${chatId}`);
      } else if (type === "chatMessage") {
        logger.logInfoMsg(
          `Received message in chat ${chatId} by ${userId}: ${message}`
        );
        try {
          logger.logInfoMsg("Saving message to database...");
          // Create and save the new message
          const newMessage = new Message({
            author: userId,
            chat: chatId,
            content: content,
          });

          console.log("newMessage:", newMessage);

          const savedMessage = await newMessage.save();
          // Populate the author field with User username
          const populatedMessage = await Message.findById(
            savedMessage._id
          ).populate({ path: "author", model: User, select: "username" });

          logger.logInfoMsg("Message saved:", savedMessage);

          // Broadcast the message to other clients in the same chat room
          if (chatRooms.has(chatId)) {
            chatRooms.get(chatId).forEach((client) => {
              if (client !== ws && client.readyState === webSocket.OPEN) {
                client.send(
                  JSON.stringify({
                    type: "chatMessage",
                    chatId: chatId,
                    message: populatedMessage,
                  })
                );
              }
            });
          }
          lastMessage = populatedMessage;
        } catch (err) {
          logger.logErrorMsg("Error saving message:", err);
        }
      } else if (type === "leave") {
        const { chatId } = message;
        logger.logInfoMsg(`Client left chat: ${chatId}`);
        if (chatRooms.has(chatId)) {
          chatRooms.get(chatId).delete(ws);
          // If the chat room is empty, remove it from the map
          if (chatRooms.get(chatId).size === 0) {
            chatRooms.delete(chatId);
          }
        }
      }
    });
    ws.on("close", () => {
      logger.logInfoMsg("Client disconnected");

      // Remove the client from the online users map
      onlineUsers.delete(ws.userId);
      logger.logInfoMsg(`Client ${ws.userId} disconnected`);
    });
  });
};

/*
      if (type === "join") {
        logger.logInfoMsg(`Client joined chat: ${chatId}`);
        ws.chatId = chatId;

        if (!chatRooms.has(chatId)) {
          chatRooms.set(chatId, new Set());
        }
        chatRooms.get(chatId).add(ws);
      } else if (type === "message") {
        logger.logInfoMsg(`Received message in chat ${chatId}: ${message}`);

        try {
          logger.logInfoMsg("Saving message to database...");
          logger.logDebugMsg("author:", userId);
          // Create and save the new message
          const newMessage = new Message({
            author: userId,
            chat: chatId,
            content: message,
          });
          const savedMessage = await newMessage.save();
          // Populate the author field with User username
          const populatedMessage = await Message.findById(
            savedMessage._id
          ).populate({
            path: "author",
            model: User,
            select: "username",
          });
          logger.logInfoMsg("Message saved:", savedMessage);

          // Broadcast the message to other clients in the same chat room
          if (chatRooms.has(chatId)) {
            chatRooms.get(chatId).forEach((client) => {
              if (client !== ws && client.readyState === webSocket.OPEN) {
                client.send(
                  JSON.stringify({ chatId, message: populatedMessage })
                );
              }
            });
          }
          lastMessage = populatedMessage;
        } catch (err) {
          logger.logErrorMsg("Error saving message:", err);
        }
      }
    });
*/

/*
ws.on("close", async () => {
      logger.logInfoMsg("Client disconnected");

      // Remove the client from the chat room
      if (ws.chatId && chatRooms.has(ws.chatId)) {
        chatRooms.get(ws.chatId).delete(ws);

        // If the chat room is empty, remove it from the map
        if (chatRooms.get(ws.chatId).size === 0) {
          chatRooms.delete(ws.chatId);
        }
      }

      // Update lastMessage in the Chat model populated with the last message content
      if (lastMessage) {
        try {
          await Chat.findByIdAndUpdate(
            lastMessage.chat, // Use the chat ID from the last message
            {
              lastMessage: lastMessage.content, // Update with the message content
              lastMessageAt: new Date(), // Optionally update the timestamp
            },
            { new: true } // Return the updated document
          );
          logger.logInfoMsg("Chat lastMessage updated successfully");
        } catch (err) {
          logger.logErrorMsg("Error updating Chat lastMessage:", err);
        }
      }
    });
  });
};
*/
// TODO:
// 1. frontend: messages list not auto scrolling - Done
// 2. backend: populate message author in the broadcasted message
// 3. backend: update User rooms list after the first message sent
// 4. backend: update Chat lastMessage and lastMessageAt after message sent
