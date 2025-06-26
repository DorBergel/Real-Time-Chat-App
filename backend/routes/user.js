const express = require("express");
const userController = require("../controllers/userController");
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
router.get("/:userId", verifyUserAccess, userController.getUserDocById);


/**
 * @desc    Upload profile picture for a user
 * @route   POST /api/user/profile-picture/:userId
 * @access  Private
 * @param   {string} userId - The ID of the user whose profile picture is to be uploaded
 * @param   {file} profilePicture - The profile picture file to be uploaded
 * @returns {object} - The updated user document with the new profile picture URL
 * @throws  {Error} - If the user is not found, if the file is not provided, or if there is an error during the upload
 */
router.post(
  "/profile-picture/:userId",
  verifyUserAccess,
  upload.single("profilePicture"),
  userController.uploadProfilePicture
);

/**
 * @desc    Edit user profile
 * @route   PUT /api/user/edit-profile/:userId
 * @access  Private
 * @param   {string} userId - The ID of the user whose profile is to be edited
 * @param   {object} userData - The data to update the user's profile (e.g., username, status)
 * @returns {object} - The updated user document    
 */
router.post(
  "/edit-profile/:userId",
  verifyUserAccess,
  userController.editUserProfile
);


module.exports = router;
