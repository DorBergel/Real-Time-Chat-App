require("dotenv").config({ path: "./config/.env" });
var express = require("express");
const logger = require("./utils/logger");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const { initializeChatWebSocket } = require("./sockets/chatSocket");

// Connect to the database
require("./config/db").connectDB();

// Routes
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const chatRouter = require("./routes/chat");
const messageRouter = require("./routes/message");

// Initialize Express app
var app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Use routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
//const chatSocket = require("./sockets/chatSocket");
//chatSocket(server);

// Start the server
const PORT = process.env.APP_PORT;

server.listen(PORT, (error) => {
  if (!error) {
    logger.logInfoMsg(
      `Server is Successfully Running, and App is listening on port ${PORT}`
    );
  } else {
    logger.logErrorMsg(`Error occurred, server can't start ${error}`);
  }
});

initializeChatWebSocket(server);

module.exports = app;
