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
