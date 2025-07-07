require("dotenv").config({ path: "./config/.env" });
var createError = require("http-errors");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

// Connect to the database
require("./config/db").connectDB();

const app = express();

console.log("Setting up view engine...");
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "https://adorable-youtiao-284ca3.netlify.app",
  "https://venerable-pithivier-cb8bed.netlify.app",
  "http://localhost:3000", // for local development
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/user"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/message", require("./routes/message"));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.error("Express error handler triggered:", {
    message: err.message,
    status: err.status || 500,
    url: req.url,
    method: req.method,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

console.log("Express app initialization complete");

module.exports = app;
