const express = require("express");
const userController = require("../controllers/userController");
const verifyUserAccess = require("../middlewares/verifyUserAccess");
const upload = require("../middlewares/uploadMiddleware");
const router = express.Router();

/**
 * @desc    Search users by username, first name, or last name
 * @route   GET /api/user/search
 * @access  Private
 * @param   {string} query - The search query to filter users by username, first name, or last name
 * @returns {object} - An array of user documents that match the search criteria
 * @throws  {Error} - If the search query is not provided or if there is an error during the search
 */
router.get("/search", verifyUserAccess, userController.searchUsers);

/**
 * @desc    Get basic contact information by user ID username, image, status
 * @route   GET /api/user/contact_basic/:id
 * @access  Private
 * @param   {string} id - The ID of the user whose basic contact information is to be retrieved
 * @returns {object} - The basic contact information of the user (username, profile picture, status)
 * @throws  {Error} - If the user is not found or if there is an error during retrieval
 */
router.get(
  "/contact_basic/:contactId",
  verifyUserAccess,
  userController.getContactBasicInfo
);

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

/**
 * @desc    Change user password
 * @route   PUT /api/user/password/:userId
 * @access  Private
 * @param   {string} userId - The ID of the user whose password is to be changed
 * @param   {object} passwordData - The data containing the old and new passwords
 * @returns {object} - A success message or an error message
 */
router.put(
  "/password/:userId",
  verifyUserAccess,
  userController.changeUserPassword
);

/**
 * @desc    Delete a contact from the user's contact list
 * @route   POST /api/user/delete-contact/:userId
 * @access  Private
 * @param   {string} userId - The ID of the user whose contact is to be deleted
 * @returns {object} - A success message or an error message
 * @throws  {Error} - If the user is not found or if there is an error during deletion
 */
router.post(
  "/delete-contact/:userId",
  verifyUserAccess,
  userController.deleteContact
);

/**
 * @desc    Add a contact to the user's contact list
 * @route   POST /api/user/add-contact/:userId
 * @access  Private
 * @param   {string} userId - The ID of the user who is adding a contact
 * @returns {object} - The updated user document with the new contact added
 * @throws  {Error} - If the user is not found, if the contact already exists, or if there is an error during addition
 */
router.post(
  "/add-contact/:userId",
  verifyUserAccess,
  userController.addContact
);

module.exports = router;
