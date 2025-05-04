const webSocket = require("ws");
const logger = require("../utils/logger");
const Message = require("../models/Message");

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

  const chatRooms = new Map(); // Map to store chat rooms and their clients
  wss.on("connection", (ws) => {
    logger.logInfoMsg("New client connected");

    ws.on("message", async (data) => {
      const parsedData = JSON.parse(data);
      const { type, chatId, message } = parsedData;

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
          // Create and save the new message
          const newMessage = new Message({ author: ws.userId, chat: chatId, content: message });
          const savedMessage = await newMessage.save();
          console.log("Saved message:", savedMessage);

          // Broadcast the message to other clients in the same chat room
          if (chatRooms.has(chatId)) {
            chatRooms.get(chatId).forEach((client) => {
              if (client !== ws && client.readyState === webSocket.OPEN) {
                client.send(JSON.stringify({ chatId, message: savedMessage }));
              }
            });
          }
        } catch (err) {
          logger.logErrorMsg("Error saving message:", err);
        }
      }
    });

    ws.on("close", () => {
      logger.logInfoMsg("Client disconnected");
      if (ws.chatId && chatRooms.has(ws.chatId)) {
        chatRooms.get(ws.chatId).delete(ws);
        if (chatRooms.get(ws.chatId).size === 0) {
          chatRooms.delete(ws.chatId);
        }
      }
    });
  });
};
// TODO:
// 1. frontend: messages list not auto scrolling - Done
// 2. backend: populate message author in the broadcasted message
// 3. backend: update User rooms list after the first message sent
// 4. backend: update Chat lastMessage and lastMessageAt after message sent