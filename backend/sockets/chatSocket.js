const webSocket = require("ws");
const logger = require("../utils/logger");
/** 
exports.setUpWebSocket = (server) => {
  const wss = new webSocket.Server({ server });

  wss.on("connection", (ws) => {
    logger.logInfoMsg("New client connected");

    ws.on("message", (message) => {
      const messageString = message.toString(); // Convert Buffer to string
      logger.logInfoMsg(`Received message: ${messageString}`);
      logger.logDebugMsg("Received message type:", typeof messageString);

      // SEND MESSAGE TO OTHER CLIENT IN THE SAME CHAT
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === webSocket.OPEN) {
          client.send(messageString);
        }
      });
    });

    ws.on("close", () => {
      logger.logInfoMsg("Client disconnected");
    });
  });

  return wss;
};
**/

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

  wss.on("connection", (ws) => {
    logger.logInfoMsg("New client connected");

    ws.on("join", (chatId) => {
      logger.logInfoMsg(`Client joined chat: ${chatId}`);
      ws.chatId = chatId; // Store the chatId in the WebSocket instance
    });
  });
};
// TODO:
// 1. backend: duplicated message
// 2. frontend: messages list not auto scrolling
