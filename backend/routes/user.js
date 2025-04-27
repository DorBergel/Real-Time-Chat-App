const express = require("express");
const authController = require("../controllers/userController");
const verifyUserAccess = require("../middlewares/verifyUserAccess");
const router = express.Router();

/**
 * @desc    Get user contacts
 * @route   GET /api/user/contacts/:userId
 * @access  Private
 * @param   {string} userId - The ID of the user whose contacts are to be retrieved
 * @returns {object} - The contacts of the user
 * @throws  {Error} - If the required data is not provided or if there is an error during retrieval
 */
router.get(
  "/contacts/:userId",
  verifyUserAccess,
  authController.getUserContacts
);

/**
 * @desc    Get user chats
 * @route   GET /api/user/chats/:userId
 * @access  Private
 * @param   {string} userId - The ID of the user whose chats are to be retrieved
 * @returns {object} - The chats of the user
 * @throws  {Error} - If the required data is not provided or if there is an error during retrieval
 * @notes   If the chat is not a group chat, the request user is not included in the participants list
 *          and the title of the chat is set to the participant's ID.
 *  
 */
router.get(
  "/chats/:userId",
  verifyUserAccess,
  authController.getUserChats
);

/**
 * @desc    Get user username
 * @route   GET /api/user/username/:userId
 * @access  Private
 * @param   {string} userId - The ID of the user whose username is to be retrieved
 * @returns {object} - The username of the user
 * @throws  {Error} - If the required data is not provided or if there is an error during retrieval
 */
router.get(
  "/username/:userId",
  verifyUserAccess,
  authController.getUserById
);

module.exports = router;
