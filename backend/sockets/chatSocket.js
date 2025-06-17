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

              // Step 1: Create new chat object (not saving yet)
              const newChat = new Chat({
                _id: chat._id,
                participants: chat.participants,
                title: chat.title,
              });

              // Step 2: Create and save new message
              const newMessage = new Message({
                chat: newChat._id,
                author: userId,
                content: message.content,
              });
              await newMessage.save();

              // Step 3: Set lastMessage BEFORE saving the chat
              newChat.lastMessage = newMessage._id;
              await newChat.save(); // Now chat has lastMessage properly saved

              logger.logInfoMsg(
                `SOCKET New chat created with ID: ${newChat._id}`
              );

              // Step 4: Update onlineUsers chat tracking
              onlineUsers.forEach((userData) => {
                if (
                  userData.userId === userId ||
                  chat.participants.includes(userData.userId)
                ) {
                  userData.chats.add(newChat._id.toString());
                }
              });

              // Step 5: Populate chat with lastMessage
              const populatedChat = await Chat.findById(newChat._id).populate({
                path: "lastMessage",
                model: Message,
                populate: {
                  path: "author",
                  model: User,
                  select: "username _id",
                },
              });

              // Step 6: Notify participants via WebSocket
              onlineUsers.forEach((userData, ws) => {
                if (userData.chats.has(newChat._id.toString())) {
                  ws.send(
                    JSON.stringify({
                      type: "newMessage",
                      chatId: newChat._id,
                      load: {
                        message: populatedChat.lastMessage,
                        chat: populatedChat,
                      },
                    })
                  );
                }
              });

              // Step 7: Update user models
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
                    logger.logErrorMsg(
                      `SOCKET Participant not found: ${participantId}`
                    );
                  }
                })
              );
            } else {
              logger.logInfoMsg(`SOCKET Chat found with ID: ${foundChat._id}`);

              // Create and save message
              const newMessage = new Message({
                chat: foundChat._id,
                author: userId,
                content: message.content,
              });
              await newMessage.save();

              // Update lastMessage of existing chat
              foundChat.lastMessage = newMessage._id;
              await foundChat.save();

              logger.logInfoMsg(
                `SOCKET New message created with ID: ${newMessage._id}`
              );

              const populatedMessage = await Message.findById(
                newMessage._id
              ).populate({
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
                          message: populatedMessage,
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
        } else if (type === "seenMessage") {
          const { chatId, messagesId } = load;

          if (
            !chatId ||
            !Array.isArray(messagesId) ||
            messagesId.length === 0
          ) {
            logger.logErrorMsg(
              "SOCKET Chat ID or Message ID not provided or invalid"
            );
            ws.send(
              JSON.stringify({
                error: "Chat ID or Message ID not provided or invalid",
              })
            );
            return;
          }

          try {
            // Find the relevant messages and update seenBy array
            const messages = await Message.updateMany(
              { _id: { $in: messagesId }, chat: chatId },
              { $addToSet: { seenBy: userId } }
            );

            // Check if any messages were updated
            if (messages.modifiedCount > 0) {
              logger.logInfoMsg(
                `SOCKET User ${userId} marked messages as seen in chat ${chatId}`
              );

              // Notify all participants in the chat about the seen status
              onlineUsers.forEach((userData, userWs) => {
                if (userData.chats.has(chatId.toString())) {
                  try {
                    userWs.send(
                      JSON.stringify({
                        type: "seenMessage",
                        userId: userId,
                        load: { chatId: chatId, messagesId: messagesId },
                      })
                    );
                  } catch (error) {
                    logger.logErrorMsg(
                      `SOCKET Error sending seen notification to user ${userData.userId}: ${error.message}`
                    );
                  }
                }
              });
            } else {
              logger.logInfoMsg(
                `SOCKET No messages found to mark as seen in chat ${chatId}`
              );
              ws.send(
                JSON.stringify({ error: "No messages found to mark as seen" })
              );
            }
          } catch (error) {
            logger.logErrorMsg(
              `SOCKET Error marking messages as seen for chat ${chatId}: ${error.message}`
            );
            ws.send(
              JSON.stringify({ error: "Error marking messages as seen" })
            );
          }
        } else if (type === "isTyping") {
          const { chatId } = load;

          if (!chatId) {
            logger.logErrorMsg(
              "SOCKET Chat ID not provided for typing notification"
            );
            ws.send(JSON.stringify({ error: "Chat ID not provided" }));
            return;
          }

          logger.logInfoMsg(
            `SOCKET User ${userId} is typing in chat ${chatId}`
          );
          onlineUsers.forEach((userData, userWs) => {
            if (userData.chats.has(chatId.toString())) {
              try {
                userWs.send(
                  JSON.stringify({
                    type: "isTyping",
                    userId: userId,
                    load: { chatId: chatId },
                  })
                );
              } catch (error) {
                logger.logErrorMsg(
                  `SOCKET Error sending typing notification to user ${userData.userId}: ${error.message}`
                );
              }
            }
          });
        } else if (type === "newGroup") {
          const { participants, title } = load;
          const chatParticipants = [userId, ...participants];

          // Ensure participants is an array and has at least one participant
          if (!chatParticipants || chatParticipants.length === 0) {
            logger.logErrorMsg("SOCKET No participants provided for new group");
            ws.send(JSON.stringify({ error: "No participants provided" }));
            return;
          }

          // Create a new group chat document
          const newGroupChat = new Chat({
            title: title,
            participants: chatParticipants,
            isGroup: true,
          });
          await newGroupChat.save();
          logger.logInfoMsg(
            `SOCKET New group chat created with ID: ${newGroupChat._id}`
          );

          // Add the new group chat to each participant's chats
          await Promise.all(
            chatParticipants.map(async (participantId) => {
              const participant = await User.findById(participantId);
              if (participant) {
                participant.chats.push(newGroupChat._id);
                await participant.save();
                logger.logInfoMsg(
                  `SOCKET Added new group chat ID ${newGroupChat._id} to user ${participantId}`
                );
              } else {
                logger.logErrorMsg(
                  `SOCKET Participant not found: ${participantId}`
                );
              }
            })
          );

          // Update onlineUsers with the new group chat
          onlineUsers.forEach((userData) => {
            if (chatParticipants.includes(userData.userId)) {
              userData.chats.add(newGroupChat._id.toString());
            }
          });
          logger.logInfoMsg(
            `SOCKET Updated online users with new group chat ID: ${newGroupChat._id}`
          );

          // Notify all participants about the new group chat
          onlineUsers.forEach((userData, userWs) => {
            if (userData.chats.has(newGroupChat._id.toString())) {
              try {
                userWs.send(
                  JSON.stringify({
                    type: "newGroup",
                    userId: userId,
                    load: { chat: newGroupChat },
                  })
                );
              } catch (error) {
                logger.logErrorMsg(
                  `SOCKET Error sending new group notification to user ${userData.userId}: ${error.message}`
                );
              }
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
      onlineUsers.delete(ws);
    });

    ws.on("error", (error) => {
      logger.logErrorMsg(`SOCKET Error: ${error.message}`);
    });
  });
};
