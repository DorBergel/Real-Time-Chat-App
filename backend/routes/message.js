const express = require("express");
const messageController = require("../controllers/messageController");
const verifyUserAccess = require("../middlewares/verifyUserAccess");
const router = express.Router();


/**
 * @desc    Get chat messages
 * @route   GET /api/chat/:chatId
 * @access  Private
 * @param   {string} chatId - The ID of the chat
 * @returns {object} - The chat messages object
 * @throws  {Error} - If the required data is not provided or if there is an error during chat retrieval
*/
router.get("/:chatId", verifyUserAccess, messageController.getChatMessages);


module.exports = router;