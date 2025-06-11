const webSocket = require("ws");
const logger = require("../utils/logger");
const Message = require("../models/Message");
const User = require("../models/User");
const Chat = require("../models/Chat");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// ... all your imports remain unchanged

exports.initializeChatWebSocket = (server) => {
  const wss = new webSocket.Server({ noServer: true });

  const onlineUsers = new Map(); // Map <WebSocket, { userId, chats: Set<string> }>

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

    onlineUsers.set(ws, { userId: userId, chats: new Set() });

    if (!userId) {
      console.error("SOCKET User ID not found in token");
      ws.send(JSON.stringify({ error: "User ID not found in token" }));
      ws.close();
      return;
    }

    const userChats = await User.findById(userId).select("chats");

    if (!userChats) {
      console.error("SOCKET User not found:", userId);
      ws.send(JSON.stringify({ error: "User not found" }));
      ws.close();
      return;
    }

    // 🛠️ Store all chat IDs as strings
    onlineUsers.get(ws).chats = new Set(
      userChats.chats.map((id) => id.toString())
    );

    ws.send(
      JSON.stringify({
        type: "connected",
        userId: userId,
        chats: Array.from(onlineUsers.get(ws).chats),
      })
    );

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

        if (type === "newChat") {
          const { participants, title } = load;

          if (!participants || participants.length === 0) {
            logger.logErrorMsg("SOCKET No participants provided for new chat");
            ws.send(JSON.stringify({ error: "No participants provided" }));
            return;
          }

          const newChat = new Chat({ participants, title });

          logger.logInfoMsg(`SOCKET New chat created with ID: ${newChat._id}`);

          ws.send(
            JSON.stringify({
              type: "chatCreated",
              userId: userId,
              load: { chat: newChat },
            })
          );
        } else if (type === "newMessage") {
          const { chat, message } = load;

          await Chat.findById(chat).then(async (foundChat) => {
            const chatIdStr = chat._id?.toString() || chat?.toString();

            if (!foundChat) {
              logger.logInfoMsg(`SOCKET Chat not found, creating new chat`);

              const newChat = new Chat({
                _id: chat._id,
                participants: chat.participants,
                title: chat.title,
              });
              await newChat.save();

              logger.logInfoMsg(`SOCKET New chat created with ID: ${newChat._id}`);

              onlineUsers.forEach((userData) => {
                if (
                  userData.userId === userId ||
                  chat.participants.includes(userData.userId)
                ) {
                  userData.chats.add(newChat._id.toString());
                }
              });

              const newMessage = new Message({
                chat: newChat._id,
                author: userId,
                content: message.content,
              });
              await newMessage.save();

              // Update the lastMessage field in the chat
              newChat.lastMessage = newMessage._id;
              await newChat.save();

              // Populate the chat with the lastMessage field
              const populatedChat = await Chat.findById(newChat._id).populate({
                path: "lastMessage",
                model: Message,
                populate: {
                  path: "author",
                  model: User,
                  select: "username _id",
                },
              });

              // Send the WebSocket message with the populated chat
              onlineUsers.forEach((userData, ws) => {
                if (userData.chats.has(newChat._id.toString())) {
                  ws.send(
                    JSON.stringify({
                      type: "newMessage",
                      chatId: newChat._id,
                      load: {
                        message: populatedChat.lastMessage, // Use the populated message
                        chat: populatedChat,
                      },
                    })
                  );
                }
              });

              // Update participants' chats to include the new chat
              await Promise.all(
                chat.participants.map(async (participantId) => {
                  const participant = await User.findById(participantId);
                  if (participant) {
                    participant.chats.push(newChat._id);
                    await participant.save();
                    logger.logInfoMsg(
                      `SOCKET Added new chat ID ${newChat._id} to user ${participantId}`
                    );
                  } else {
                    logger.logErrorMsg(`SOCKET Participant not found: ${participantId}`);
                  }
                })
              );
            } else {
              logger.logInfoMsg(`SOCKET Chat found with ID: ${foundChat._id}`);

              const newMessage = new Message({
                chat: foundChat._id,
                author: userId,
                content: message.content,
              });
              await newMessage.save();
              logger.logInfoMsg(`SOCKET New message created with ID: ${newMessage._id}`);

              // Populate the new message with author details
              const populatedMessage = await Message.findById(newMessage._id).populate({
                path: "author",
                model: User,
                select: "username _id",
              });

              const foundChatIdStr = foundChat._id.toString();
              let matched = false;

              onlineUsers.forEach((userData, ws) => {
                if (userData.chats.has(foundChatIdStr)) {
                  matched = true;
                  try {
                    ws.send(
                      JSON.stringify({
                        type: "newMessage",
                        chatId: foundChat._id,
                        load: {
                          message: populatedMessage, // Use the populated message
                          chat: foundChat,
                        },
                      })
                    );
                  } catch (error) {
                    logger.logErrorMsg(
                      `SOCKET Failed to send message to user ${userData.userId}: ${error.message}`
                    );
                  }
                }
              });

              if (!matched) {
                logger.logErrorMsg(
                  `SOCKET No matching recipients found for chat ${foundChatIdStr}`
                );
              }
            }
          });
        } else if (type === "messageSeen") {
          const { chatId, messageId } = load;

          if (!chatId || !messageId) {
            logger.logErrorMsg("SOCKET Chat ID or Message ID not provided");
            ws.send(JSON.stringify({ error: "Chat ID or Message ID not provided" }));
            return;
          }

          try {
            const chat = await Chat.findById(chatId);
            if (!chat) {
              logger.logErrorMsg(`SOCKET Chat not found: ${chatId}`);
              ws.send(JSON.stringify({ error: "Chat not found" }));
              return;
            }

            const message = await Message.findById(messageId);
            if (!message) {
              logger.logErrorMsg(`SOCKET Message not found: ${messageId}`);
              ws.send(JSON.stringify({ error: "Message not found" }));
              return;
            }

            message.seen = true;
            await message.save();

            logger.logInfoMsg(
              `SOCKET Message ${messageId} marked as seen in chat ${chatId}`
            );

            onlineUsers.forEach((userData, ws) => {
              if (userData.chats.has(chatId.toString())) {
                try {
                  ws.send(
                    JSON.stringify({
                      type: "messageSeen",
                      userId: userData.userId,
                      load: {
                        chatId: chatId,
                        messageId: messageId,
                      }
                    })
                  );
                } catch (error) {
                  logger.logErrorMsg(
                    `SOCKET Failed to send seen update to user ${userData.userId}: ${error.message}`
                  );
                }
              }
            });
          }
          catch (error) {
            logger.logErrorMsg(`SOCKET Error processing messageSeen: ${error.message}`);
            ws.send(JSON.stringify({ error: "Error processing messageSeen" }));
          }
        }
      } catch (error) {
        logger.logErrorMsg(`SOCKET Error processing message: ${error.message}`);
        ws.send(JSON.stringify({ error: "Invalid message format" }));
      }
    });

    ws.on("close", () => {
      logger.logInfoMsg(`SOCKET User ${userId} disconnected`);
      onlineUsers.delete(ws);
    });

    ws.on("error", (error) => {
      logger.logErrorMsg(`SOCKET Error: ${error.message}`);
    });
  });
};
