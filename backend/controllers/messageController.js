const logger = require("../utils/logger");
const messageServices = require("../services/messageServices");
const { get } = require("mongoose");

exports.getChatMessages = async (req, res) => {
  logger.logInfoMsg(`${req.ip} is trying to get chat messages`);

  const { chatId } = req.params;

  logger.logDebugMsg(`chatId: ${chatId}`);

  // Verify the required data received
  if (!chatId) {
    logger.logErrorMsg(`required data not retrieved`);
    return res.status(400).json({ reason: "required data not retrieved" });
  }

  try {
    const messages = await messageServices.getChatMessages(chatId);
    logger.logInfoMsg(`chat messages retrieved successfully`);
    return res.status(200).json({ messages });
  } catch (err) {
    logger.logErrorMsg(`${err}`);
    return res.status(500).json({ reason: err.message });
  }
};

exports.createChatMessage = async (req, res) => {
  logger.logInfoMsg(`${req.ip} is trying to create a new chat message`);

  const { userId, chatId, content } = req.body;

  logger.logDebugMsg(`request body: ${JSON.stringify(req.body)}`);

  logger.logDebugMsg(`chatId: ${chatId}`);
  logger.logDebugMsg(`message: ${content}`);

  // Verify the required data received
  if (!chatId || !content) {
    logger.logErrorMsg(`required data not retrieved`);
    return res.status(400).json({ reason: "required data not retrieved" });
  }

  try {
    const newMessage = await messageServices.createChatMessage(
      userId,
      chatId,
      content
    );
    logger.logInfoMsg(`new chat message created successfully`);
    return res.status(201).json({ newMessage });
  } catch (err) {
    logger.logErrorMsg(`${err}`);
    return res.status(500).json({ reason: err.message });
  }
};
