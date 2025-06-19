const logger = require("../utils/logger");

const userServices = require("../services/userServices");

exports.getUserContacts = async (req, res) => {
  logger.logInfoMsg(`${req.ip} is trying to get user contacts`);

  const { userId } = req.params;

  logger.logDebugMsg(`userId: ${userId}`);

  // Verify the required data received
  if (!userId) {
    logger.logErrorMsg(`required data not provided`);
    return res.status(400).json({ reason: "required data not provided" });
  }

  try {
    const contacts = await userServices.getUserContacts(userId);
    logger.logInfoMsg(`user contacts retrieved successfully`);
    return res.status(200).json({ contacts });
  } catch (err) {
    logger.logErrorMsg(`${err}`);
    return res.status(500).json({ reason: err.message });
  }
};

exports.getUserChats = async (req, res) => {
  logger.logInfoMsg(`${req.ip} is trying to get user chats`);

  const { userId } = req.params;

  logger.logDebugMsg(`userId: ${userId}`);

  // Verify the required data received
  if (!userId) {
    logger.logErrorMsg(`required data not provided`);
    return res.status(400).json({ reason: "required data not provided" });
  }

  // Validate userId format
  const mongoose = require("mongoose");
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    logger.logErrorMsg(`Invalid userId format`);
    return res.status(400).json({ reason: "Invalid userId format" });
  }

  try {
    const chats = await userServices.getUserChats(userId);
    logger.logDebugMsg(`chats: ${JSON.stringify(chats)}`);
    logger.logInfoMsg(`user chats retrieved successfully`);
    return res.status(200).json({ chats });
  } catch (err) {
    logger.logErrorMsg(`${err}`);
    return res.status(500).json({ reason: err.message });
  }
};

exports.getUserById = async (req, res) => {
  logger.logInfoMsg(`${req.ip} is trying to get user username`);

  const { userId } = req.params;

  logger.logDebugMsg(`userId: ${userId}`);

  // Verify the required data received
  if (!userId) {
    logger.logErrorMsg(`required data not provided`);
    return res.status(400).json({ reason: "required data not provided" });
  }

  try {
    const username = await userServices.getUserById(userId);
    logger.logInfoMsg(`user username retrieved successfully`);
    return res.status(200).json({ username });
  } catch (err) {
    logger.logErrorMsg(`${err}`);
    return res.status(500).json({ reason: err.message });
  }
};

exports.addContact = async (req, res) => {
  logger.logInfoMsg(`${req.ip} is trying to add a new contact`);

  const { userId } = req.params;
  const { contactUsername } = req.body;

  logger.logDebugMsg(`userId: ${userId}, contactUsername: ${contactUsername}`);

  // Verify the required data received
  if (!userId || !contactUsername) {
    logger.logErrorMsg(`required data not provided`);
    return res.status(400).json({ reason: "required data not provided" });
  }

  try {
    const updatedContactsList = await userServices.addContact(
      userId,
      contactUsername
    );
    logger.logInfoMsg(`contact added successfully`);
    return res.status(200).json({ contacts: updatedContactsList });
  } catch (err) {
    logger.logErrorMsg(`${err}`);
    return res.status(500).json({ reason: err.message });
  }
};

exports.createChat = async (req, res) => {
  logger.logInfoMsg(`${req.ip} is trying to create a new chat`);

  const { userId, contactId } = req.body;

  logger.logDebugMsg(`userId: ${userId}, contactId: ${contactId}`);

  // Verify the required data received
  if (!userId || !contactId) {
    logger.logErrorMsg(`required data not provided`);
    return res.status(400).json({ reason: "required data not provided" });
  }

  try {
    const newChat = await userServices.createChat(userId, contactId);
    logger.logInfoMsg(`chat created successfully`);
    return res.status(201).json({ chat: newChat });
  } catch (err) {
    logger.logErrorMsg(`${err}`);
    return res.status(500).json({ reason: err.message });
  }
};

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

exports.uploadProfilePicture = async (req, res) => {
  logger.logInfoMsg(`${req.ip} is trying to upload a profile picture`);

  const { userId } = req.params;
  const profilePicture = req.file;

  logger.logDebugMsg(
    `userId: ${userId}, profilePicture: ${
      profilePicture ? profilePicture.filename : "No file uploaded"
    }`
  );

  // Verify the required data received
  if (!userId || !profilePicture) {
    logger.logErrorMsg(`required data not provided`);
    return res.status(400).json({ reason: "required data not provided" });
  }
  try {
    const updatedUser = await userServices.uploadProfilePicture(
      userId,
      profilePicture
    );
    logger.logInfoMsg(`profile picture uploaded successfully`);
    return res.status(200).json({ user: updatedUser });
  } catch (err) {
    logger.logErrorMsg(`${err}`);
    return res.status(500).json({ reason: err.message });
  }
};

exports.getProfilePicture = async (req, res) => {
  logger.logInfoMsg(`${req.ip} is trying to get profile picture`);

  const { userId } = req.params;

  logger.logDebugMsg(`userId: ${userId}`);

  // Verify the required data received
  if (!userId) {
    logger.logErrorMsg(`required data not provided`);
    return res.status(400).json({ reason: "required data not provided" });
  }

  try {
    const profilePictureUrl = await userServices.getProfilePicture(userId);
    logger.logInfoMsg(`profile picture retrieved successfully`);
    return res.status(200).json({ profilePicture: profilePictureUrl });
  } catch (err) {
    logger.logErrorMsg(`${err}`);
    return res.status(500).json({ reason: err.message });
  }
};
