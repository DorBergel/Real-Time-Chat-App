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
              { lastMessage: newMessage._id },
              { new: true }
            );
          }
          else if (type === "messageSeen") {
            logger.logInfoMsg(`SOCKET Message seen event received in chat ${chatId} by ${message}`);

            // if event sent from the author of the message - do not update the messages as seen
            // find all unseen messages in the chat
            const unseenMessages = await Message.find({
              chat: chatId,
              seen: false});
            if (unseenMessages.length === 0) {
              logger.logInfoMsg(`SOCKET No unseen messages in chat ${chatId}`);
              return;
            }

            // update all unseen messages which are not sent by the event sender
            await Message.updateMany({chat: chatId, seen: false, author: { $ne: message }}, { seen: true });
            logger.logInfoMsg(`SOCKET Updated messages as seen in chat ${chatId} sent from ${message}`);

            // use lastMessage to send the last message seen event
            const lastMessage = await Message.findOne({ chat: chatId, seen: true })
              .sort({ createdAt: -1 })
              .populate({ path: "author", select: "username", model: User });

            // Broadcast the seen message to all connected clients in the same chat room
            onlineUsers.forEach((chatIdSet, clientSocket) => {
              if (chatIdSet.has(chatId)) {
                clientSocket.send(
                  JSON.stringify({
                    type: "messageSeen",
                    chatId: chatId,
                    message: lastMessage
                  })
                );
              }});
            
            } else if (type === "newChat") {
              // <type> is "newChat", <chatId> is the ID of the contact, <message> {userId, contactId}
              logger.logInfoMsg(`SOCKET New chat event received: ${JSON.stringify(message)}`);

              const { userId, contactId } = message;

              if (!userId || !contactId) {
                logger.logErrorMsg("SOCKET Invalid new chat message format");
                return;
              }

              const userUsername = await User.findById(userId).select("username");
              const contactUsername = await User.findById(contactId).select("username");

              // Create a new chat document in the database
              const newChat = await Chat.create({
                title: `${userUsername.username}&${contactUsername.username}`,
                participants: [userId, contactId],
              });

              // Populate the newChat object with participants and lastMessage
              const populatedChat = await Chat.findById(newChat._id)
                .populate({ path: "participants", model: "User" })
                .populate({ path: "lastMessage", model: "Message" });

              logger.logInfoMsg(`SOCKET New chat created with ID: ${populatedChat._id}`);

              // Add the new chat to both users' chats
              await User.findByIdAndUpdate(userId, {
                $addToSet: { chats: populatedChat._id },
              });

              await User.findByIdAndUpdate(contactId, {
                $addToSet: { chats: populatedChat._id },
              });

              // Add the new chat to the online user and participant sets
              onlineUsers.get(ws).add(populatedChat._id.toString());
              onlineUsers.forEach((chatIdSet, clientSocket) => {
                if (clientSocket.token) {
                  const clientUserId = jwt.verify(
                    clientSocket.token,
                    process.env.JWT_SECRET
                  ).id;
                  if (clientUserId === userId || clientUserId === contactId) {
                    chatIdSet.add(populatedChat._id.toString());
                  }
                }
              }
              );

              // Broadcast the new chat to all connected clients in the same chat room
              onlineUsers.forEach((chatIdSet, clientSocket) => {
                if (chatIdSet.has(populatedChat._id.toString())) {
                  clientSocket.send(
                    JSON.stringify({
                      type: "newChat",
                      chatId: populatedChat._id,
                      message: populatedChat,
                    })
                  );
                }
              });

              // Send the populated chat object to the frontend
              ws.send(
                JSON.stringify({
                  type: "newChat",
                  chatId: populatedChat._id,
                  message: populatedChat,
                })
              );



              // TODO: Frontend should handle the new chat event creation and display it in the UI
              // TODO: chat title should be created based on the participants' usernames
            }
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

/**
 // if event sent from the author of the message - do not update the messages as seen
            const authorId = jwt.verify(ws.token, process.env.JWT_SECRET).id;
            
            // message val type should be the message id
            logger.logInfoMsg(`SOCKET Message seen in chat ${chatId}: ${message}`);

            if( authorId === message) {
              logger.logInfoMsg(`SOCKET Author of the message is the same as the sender of the seen event - not updating messages as seen`);
              return;
            } else {
                await Message.updateMany({chat: chatId, seen: false}, { seen: true }, { new: true });

                logger.logInfoMsg(`SOCKET Updated messages as seen sent from ${message}`);
                // Broadcast the seen message to all connected clients in the same chat room
                onlineUsers.forEach((chatIdSet, clientSocket) => {
                  if (chatIdSet.has(chatId)) {
                    clientSocket.send(
                      JSON.stringify({
                        type: "messageSeen",
                        chatId: chatId,
                        message: `all messages in this chat are now seen.(event sent ${populatedMessages.author.username})`,
                      })
                    );
                  }
                });
 */