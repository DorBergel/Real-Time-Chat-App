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