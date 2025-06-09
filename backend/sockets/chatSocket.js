const webSocket = require("ws");
const logger = require("../utils/logger");
const Message = require("../models/Message");
const User = require("../models/User");
const Chat = require("../models/Chat");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

exports.initializeChatWebSocket = (server) => {
  const wss = new webSocket.Server({ noServer: true });

  const onlineUsers = new Map(); // Map to keep track of online users <WebSocket, Set<ChatId>>

  // Handle HTTP upgrade requests to WebSocket
  server.on("upgrade", (request, socket, head) => {
    const url = request.url;
    const token = url?.split("?")[1]?.split("=")[1];

    if (!token) {
      console.error("SOCKET Token not found in the URL:", url);
      socket.destroy();
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      request.user = decoded;
      wss.handleUpgrade(request, socket, head, (ws) => {
        ws.token = token;
        wss.emit("connection", ws, request);
      });
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        console.error("SOCKET Token expired:", err);
        socket.write("HTTP/1.1 440 Login Timeout\r\n\r\nToken expired");
      } else {
        console.error("SOCKET Token verification failed:", err);
      }
      socket.destroy();
    }
  });

  wss.on("connection", async (ws) => {
    logger.logInfoMsg("SOCKET New client connected");
    const userId = ws.token ? jwt.decode(ws.token).id : null;

    // Section to store user ID and chats in a map
    onlineUsers.set(ws, { userId: userId, chats: new Set() }); // Store user ID and chats in the map for each WebSocket
    if (!userId) {
      console.error("SOCKET User ID not found in token");
      ws.send(JSON.stringify({ error: "User ID not found in token" }));
      ws.close();
      return;
    }

    // Fetch user details and chats
    const userChats = await User.findById(userId).select("chats");

    if (!userChats) {
      console.error("SOCKET User not found:", userId);
      ws.send(JSON.stringify({ error: "User not found" }));
      ws.close();
      return;
    }

    // Store the chats in the onlineUsers map);
    onlineUsers.get(ws).chats = new Set(userChats.chats); // Store chat IDs in the map

    logger.logInfoMsg(
      `SOCKET User ${userId} connected with chats: ${Array.from(
        onlineUsers.get(ws).chats
      )}`
    );

    ws.on("message", async (message) => {
      try {
        const parsedMessage = JSON.parse(message);
        const { type, userId, load } = parsedMessage;

        logger.logDebugMsg(
          `SOCKET Received message of type: ${type} from user: ${userId}`
        );
        logger.logDebugMsg(`SOCKET Message content: ${JSON.stringify(load)}`);

        /*
        When a newChat event is received,
        We create a new chat and send it to the user.
        Note: The chat not saved to the database yet. 
        The chat will be saved when the user sends a message in the chat.
        This is to avoid creating empty chats in the database.
        If the user sends a message in the chat, we will save the chat to the database.
        */
        if (type === "newChat") {
          const { participants, title } = load;

          if (!participants || participants.length === 0) {
            logger.logErrorMsg("SOCKET No participants provided for new chat");
            ws.send(JSON.stringify({ error: "No participants provided" }));
            return;
          }

          const newChat = new Chat({
            participants: participants,
            title: title,
          });

          logger.logInfoMsg(`SOCKET New chat created with ID: ${newChat._id}`);

          // respond to the user with the new chat details
          ws.send(
            JSON.stringify({
              type: "chatCreated",
              userId: userId,
              load: newChat,
            })
          );
        } else if (type === "newMessage") {
          const { chat, message } = load;

          // The chatId should not be existing in the db. But the Id should be valid.
          // If the chatId is not existing in the db, we will create a new chat.
          await Chat.findById(chat).then(async (foundChat) => {
            if (!foundChat) {
              logger.logInfoMsg(`SOCKET Chat not found, creating new chat`);
              const newChat = new Chat({
                _id: chat._id,
                participants: chat.participants,
                title: chat.title,
              });
              await newChat.save();
              logger.logInfoMsg(
                `SOCKET New chat created with ID: ${newChat._id}`
              );

              // Update the onlineUsers map for author and other participants to include the new chat
              onlineUsers.forEach((userData, ws) => {
                if (
                  userData.userId === userId ||
                  chat.participants.includes(userData.userId)
                ) {
                  userData.chats.add(newChat._id);
                }
              });

              // Create a new message
              const newMessage = new Message({
                chat: newChat._id,
                author: userId,
                content: message.content,
              });
              await newMessage.save();

              logger.logInfoMsg(
                `SOCKET New message created with ID: ${newMessage._id}`
              );

              // Notify all participants about the new message
              onlineUsers.forEach((userData, ws) => {
                if (userData.chats.has(newChat._id)) {
                  ws.send(
                    JSON.stringify({
                      type: "newMessage",
                      chatId: newChat._id,
                      message: newMessage,
                    })
                  );
                }
              });
            } else {
              logger.logInfoMsg(`SOCKET Chat found with ID: ${foundChat._id}`);

              // Create a new message in the existing chat
              const newMessage = new Message({
                chat: foundChat._id,
                author: userId,
                content: message.content,
              });
              await newMessage.save();
              logger.logInfoMsg(
                `SOCKET New message created with ID: ${newMessage._id}`
              );

              // Notify all participants about the new message
              onlineUsers.forEach((userData, ws) => {
                if (userData.chats.has(foundChat._id)) {
                  ws.send(
                    JSON.stringify({
                      type: "newMessage",
                      chatId: foundChat._id,
                      message: newMessage,
                    })
                  );
                }
              });
            }
          });
        }
      } catch (error) {
        logger.logErrorMsg(`SOCKET Error processing message: ${error.message}`);
        ws.send(JSON.stringify({ error: "Invalid message format" }));
      }
    });
    ws.on("close", () => {
      logger.logInfoMsg(`SOCKET User ${userId} disconnected`);
      onlineUsers.delete(ws); // Remove the user from the onlineUsers map
    });

    ws.on("error", (error) => {
      logger.logErrorMsg(`SOCKET Error: ${error.message}`);
    });
  });
};
