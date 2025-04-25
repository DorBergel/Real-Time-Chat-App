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
router.get("/contacts/:userId", verifyUserAccess, authController.getUserContacts);

