const express = require("express");
const chatController = require("../controllers/chatController");
const verifyUserAccess = require("../middlewares/verifyUserAccess");
const router = express.Router();

/**
 * @desc    Create a new chat
 * @route   POST /api/chat
 * @access  Private
 * @param   {string} chatId - The name of the chat
 * @returns {object} - The newly created chat object
 * @throws  {Error} - If the required data is not provided or if there is an error during chat creation
 */
router.get("/:chatId", verifyUserAccess, chatController.getChat);

module.exports = router;
