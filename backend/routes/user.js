const express = require("express");
const authController = require("../controllers/userController");
const verifyUserAccess = require("../middlewares/verifyUserAccess");
const upload = require("../middlewares/uploadMiddleware");
const router = express.Router();

/**
 * @desc    Get user document by ID
 * @route   GET /api/user/:userId
 * @access  Private
 * @param   {string} userId - The ID of the user whose document is to be retrieved
 * @returns {object} - The user document
 * @throws  {Error} - If the user is not found or if there is an error during retrieval
 */
router.get("/:userId", verifyUserAccess, authController.getUserDocById);

module.exports = router;
