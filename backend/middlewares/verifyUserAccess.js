require("dotenv").config();
const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const logger = require('../utils/logger');

module.exports = (req, res, next) => {
  logger.logInfoMsg('verifyUserAccess middleware triggered');

  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.logErrorMsg(`missing or invalid Authorization header`);
    return res.status(401).json({ reason: "Missing or invalid Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
        logger.logErrorMsg(`access token expired`);
        return res.status(401).json({ reason: "Access token expired" });
    }
        return res.status(401).json({ reason: "Invalid token" });
  }
};


