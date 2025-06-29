const logger = require("../utils/logger");

const userServices = require("../services/userServices");

/**
 * @desc    Get user document by ID
 * @route   GET /api/user/:userId
 * @access  Private
 * @param   {string} userId - The ID of the user whose document is to be retrieved
 * @returns {object} - The user document
 * @throws  {Error} - If the user is not found or if there is an error during retrieval
 */
exports.getUserDocById = async (req, res) => {
  logger.logInfoMsg(`${req.ip} is trying to get user document by ID`);

  const { userId } = req.params;

  logger.logDebugMsg(`userId: ${userId}`);

  // Verify the required data received
  if (!userId) {
    logger.logErrorMsg(`required data not provided`);
    return res.status(400).json({ reason: "required data not provided" });
  }

  try {
    const userDoc = await userServices.getUserDocById(userId);
    logger.logInfoMsg(`user document retrieved successfully`);
    return res.status(200).json({ user: userDoc });
  } catch (err) {
    logger.logErrorMsg(`${err}`);
    return res.status(500).json({ reason: err.message });
  }
};

/**
 * @desc    Upload profile picture for a user
 * @route   POST /api/user/profile-picture/:userId
 * @access  Private
 * @param   {string} userId - The ID of the user whose profile picture is to be uploaded
 * @param   {file} profilePicture - The profile picture file to be uploaded
 * @returns {object} - The updated user document with the new profile picture URL
 * @throws  {Error} - If the user is not found, if the file is not provided, or if there is an error during the upload
 */
exports.uploadProfilePicture = async (req, res) => {
  logger.logInfoMsg(`${req.ip} is trying to upload profile picture`);

  const { userId } = req.params;

  logger.logDebugMsg(`userId: ${userId}`);

  // Verify the required data received
  if (!userId || !req.file) {
    logger.logErrorMsg(`required data not provided`);
    return res.status(400).json({ reason: "required data not provided" });
  }

  try {
    const updatedUserDoc = await userServices.uploadProfilePicture(userId, req.file);
    logger.logInfoMsg(`profile picture uploaded successfully`);
    return res.status(200).json({ user: updatedUserDoc });
  } catch (err) {
    logger.logErrorMsg(`${err}`);
    return res.status(500).json({ reason: err.message });
  }
}

/**
 * @desc    Edit user profile
 * @route   PUT /api/user/edit-profile/:userId
 * @access  Private
 * @param   {string} userId - The ID of the user whose profile is to be edited
 * @param   {object} userData - The data to update the user's profile (e.g., username, status)
 * @returns {object} - The updated user document
 * @throws  {Error} - If the user is not found, if the required data is not provided, or if there is an error during the update
 */
exports.editUserProfile = async (req, res) => {
  logger.logInfoMsg(`${req.ip} is trying to edit user profile`);

  const { userId } = req.params;
  const userData = req.body;

  logger.logDebugMsg(`userId: ${userId}, userData: ${userData}`);

  // Verify the required data received
  if (!userId || !userData) {
    logger.logErrorMsg(`required data not provided`);
    return res.status(400).json({ reason: "required data not provided" });
  }

  // Verify that userData not contains sensitive fields
  const sensitiveFields = ["_id", "hashed_password", "createdAt", "updatedAt"];
  for (const field of sensitiveFields) {
    if (userData[field]) {
      logger.logErrorMsg(`sensitive field ${field} cannot be updated`);
      return res.status(400).json({ reason: `sensitive field ${field} cannot be updated` });
    }
  }

  try {
    const updatedUserDoc = await userServices.editUserProfile(userId, userData);
    logger.logInfoMsg(`user profile edited successfully`);
    return res.status(200).json({ user: updatedUserDoc });
  } catch (err) {
    logger.logErrorMsg(`${err}`);
    return res.status(500).json({ reason: err.message });
  }
}


/**
 * @desc    Change user password
 * @route   PUT /api/user/password/:userId
 * @access  Private
 * @param   {string} userId - The ID of the user whose password is to be changed
 * @param   {object} body - The data containing the old and new passwords
 * @returns {object} - A success message or an error message
 * @throws  {Error} - If the user is not found, if the old password is incorrect, or if there is an error during the update
 * TODO: Add validation for password strength and format - check what happens in registration logic and consider reusing it
 */
exports.changeUserPassword = async (req, res) => {
  logger.logInfoMsg(`${req.ip} is trying to change user password`);

  const { userId } = req.params;
  const { oldPassword, newPassword } = req.body;

  logger.logDebugMsg(`userId: ${userId}, oldPassword: ${oldPassword}, newPassword: ${newPassword}`);

  // Verify the required data received
  if (!userId || !oldPassword || !newPassword) {
    logger.logErrorMsg(`required data not provided`);
    return res.status(400).json({ reason: "required data not provided" });
  }

  try {
    await userServices.changeUserPassword(userId, oldPassword, newPassword);
    logger.logInfoMsg(`user password changed successfully`);
    return res.status(200).json({ message: "User password changed successfully" });
  } catch (err) {
    logger.logErrorMsg(`${err}`);
    return res.status(500).json({ reason: err.message });
  }
}

exports.addContact = async (req, res) => {
  logger.logInfoMsg(`${req.ip} is trying to add contact`);

  const { userId } = req.params;
  const { contactId } = req.body;

  logger.logDebugMsg(`userId: ${userId}, contactId: ${contactId}`);

  // Verify the required data received
  if (!userId || !contactId) {
    logger.logErrorMsg(`required data not provided`);
    return res.status(400).json({ reason: "required data not provided" });
  }

  try {
    const updatedUserDoc = await userServices.addContact(userId, contactId);
    logger.logInfoMsg(`contact added successfully`);
    return res.status(200).json({ user: updatedUserDoc });
  } catch (err) {
    logger.logErrorMsg(`${err}`);
    return res.status(500).json({ reason: err.message });
  }
}

exports.deleteContact = async (req, res) => {
  logger.logInfoMsg(`${req.ip} is trying to delete contact`);

  const { userId } = req.params;
  const { contactId } = req.body;

  logger.logDebugMsg(`userId: ${userId}, contactId: ${contactId}`);

  // Verify the required data received
  if (!userId || !contactId) {
    logger.logErrorMsg(`required data not provided`);
    return res.status(400).json({ reason: "required data not provided" });
  }

  try {
    const updatedUserDoc = await userServices.deleteContact(userId, contactId);
    logger.logInfoMsg(`contact deleted successfully`);
    return res.status(200).json({ user: updatedUserDoc });
  } catch (err) {
    logger.logErrorMsg(`${err}`);
    return res.status(500).json({ reason: err.message });
  }
}

exports.searchUsers = async (req, res) => {
  logger.logInfoMsg(`${req.ip} is trying to search users`);

  const { query } = req.query;

  logger.logDebugMsg(`query: ${query}`);

  // Verify the required data received
  if (!query) {
    logger.logErrorMsg(`required data not provided`);
    return res.status(400).json({ reason: "required data not provided" });
  }

  try {
    const users = await userServices.searchUsers(query);
    logger.logInfoMsg(`users searched successfully`);
    return res.status(200).json({ users });
  } catch (err) {
    logger.logErrorMsg(`${err}`);
    return res.status(500).json({ reason: err.message });
  }
}