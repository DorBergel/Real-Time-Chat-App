const logger = require("../utils/logger");

const userServices = require("../services/userServices");

exports.getUserContacts = async (req, res) => {
    logger.logInfoMsg(`${req.ip} is trying to get user contacts`);
    
    const { userId } = req.params;
    
    logger.logDebugMsg(`userId: ${userId}`);
    
    // Verify the required data received
    if (!userId) {
        logger.logErrorMsg(`required data not provided`);
        return res.status(400).json({ reason: "required data not provided" });
    }
    
    try {
        const contacts = await userServices.getUserContacts(userId);
        logger.logInfoMsg(`user contacts retrieved successfully`);
        return res.status(200).json({ contacts });
    } catch (err) {
        logger.logErrorMsg(`${err}`);
        return res.status(500).json({ reason: err.message });
    }
}

exports.getUserChats = async (req, res) => {
    logger.logInfoMsg(`${req.ip} is trying to get user chats`);
    
    const { userId } = req.params;
    
    logger.logDebugMsg(`userId: ${userId}`);
    
    // Verify the required data received
    if (!userId) {
        logger.logErrorMsg(`required data not provided`);
        return res.status(400).json({ reason: "required data not provided" });
    }
    
    try {
        const chats = await userServices.getUserChats(userId);
        logger.logDebugMsg(`chats: ${JSON.stringify(chats)}`);
        logger.logInfoMsg(`user chats retrieved successfully`);
        return res.status(200).json({ chats });
    } catch (err) {
        logger.logErrorMsg(`${err}`);
        return res.status(500).json({ reason: err.message });
    }
}

exports.getUserById = async (req, res) => {
    logger.logInfoMsg(`${req.ip} is trying to get user username`);
    
    const { userId } = req.params;
    
    logger.logDebugMsg(`userId: ${userId}`);
    
    // Verify the required data received
    if (!userId) {
        logger.logErrorMsg(`required data not provided`);
        return res.status(400).json({ reason: "required data not provided" });
    }
    
    try {
        const username = await userServices.getUserById(userId);
        logger.logInfoMsg(`user username retrieved successfully`);
        return res.status(200).json({ username });
    } catch (err) {
        logger.logErrorMsg(`${err}`);
        return res.status(500).json({ reason: err.message });
    }
}