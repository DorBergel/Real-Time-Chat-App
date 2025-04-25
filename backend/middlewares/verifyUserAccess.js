require("dotenv").config();
const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const logger = require('../utils/logger');

module.exports = (req, res, next) => {
    logger.logInfoMsg('verifyUserAccess middleware triggered');

    const authHeader = req.header("Authorization");

    // Ensure the Authorization header exists and starts with "Bearer"
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        logger.logErrorMsg(`missing or invalid Authorization header`);
        return res.status(401).json({ reason: "Missing or invalid Authorization header" });
    }

    const authToken = authHeader.split(" ")[1]; // Safe split after checking `authHeader`

    try {
        const parsedToken = jwt.verify(authToken, process.env.JWT_SECRET);
        if (parsedToken) {
            logger.logInfoMsg(`user authorized`);
            req.user = parsedToken; // Attach user to request object
            next(); // Proceed to the next middleware or route handler
        }
    } catch (err) {
        logger.logErrorMsg(`user not authorized, ${err.message}`);
        return res.status(500).json({ reason: "User unauthorized" });
    }
};


