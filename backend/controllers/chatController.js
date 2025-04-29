const chatServices = require("../services/chatServices");
const logger = require("../utils/logger");

exports.getChat = async (req, res) => {
  logger.logInfoMsg(`${req.ip} is trying to get chat`);

  const { chatId } = req.params;

  logger.logDebugMsg(`chatId: ${chatId}`);

  // Verify the required data received
  if (!chatId) {
    logger.logErrorMsg(`required data not retrieved`);
    return res.status(400).json({ reason: "required data not retrieved" });
  }

  try {
    const chat = await chatServices.getChat(chatId);
    logger.logInfoMsg(`chat retrieved successfully`);
    return res.status(200).json({ chat });
  } catch (err) {
    logger.logErrorMsg(`${err}`);
    return res.status(500).json({ reason: err.message });
  }
};
