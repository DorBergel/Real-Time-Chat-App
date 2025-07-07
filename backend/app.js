require("dotenv").config({ path: "./config/.env" });
const express = require("express");
const logger = require("./utils/logger");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const path = require("path");
const { initializeChatWebSocket } = require("./sockets/chatSocket");

// Connect to the database
require("./config/db").connectDB();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*", // allow from frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/user"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/message", require("./routes/message"));

// Initialize WebSocket
initializeChatWebSocket(server);

// Start server
const PORT = process.env.PORT || 3025;
server.listen(PORT, (error) => {
  if (!error) {
    logger.logInfoMsg(`Server is running on port ${PORT}`);
  } else {
    logger.logErrorMsg(`Error starting server: ${error}`);
  }
});

module.exports = app;
