const express = require("express");
const messageController = require("../controllers/messageController");
const verifyUserAccess = require("../middlewares/verifyUserAccess");
const router = express.Router();

/**
 * @desc    Get chat messages
 * @route   GET /api/message/:chatId
 * @access  Private
 * @param   {string} chatId - The ID of the chat
 * @returns {object} - The chat messages object
 * @throws  {Error} - If the required data is not provided or if there is an error during chat retrieval
 */
router.get("/:chatId", verifyUserAccess, messageController.getChatMessages);

/**
 * @desc    Create a new chat message
 * @route   POST /api/message/:chatId
 * @access  Private
 * @param   {string} author - The ID of the message author
 * @param   {string} chatId - The ID of the chat
 * @param   {object} message - The message object containing the message details
 * @returns {object} - The created chat message object
 * @throws  {Error} - If the required data is not provided or if there is an error during message creation
 */
router.post("/:chatId", verifyUserAccess, messageController.createChatMessage);

module.exports = router;
