const e = require("express");
const authServices = require("../services/authService");
const logger = require("../utils/logger");


/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 * @param   {string} u_username - The username of the user
 * @param   {string} u_firstname - The first name of the user
 * @param   {string} u_lastname - The last name of the user
 * @param   {string} u_email - The email of the user
 * @param   {string} u_password - The password of the user
 * @param   {string} u_birthday - The birthday of the user
 * @returns {object} - The newly created user object
 * @throws  {Error} - If the required data is not provided or if there is an error during registration
 * @throws  {Error} - If the user already exists
 * @throws  {Error} - If the password is too weak
 * @throws  {Error} - If the user is too young 
 */
exports.register = async (req, res) => {
  //ip = (req.headers['x-forwarded-for'] || '').split(',')[0]
  logger.logInfoMsg(`${req.ip} is trying to signup`);

  const {
    u_username,
    u_firstname,
    u_lastname,
    u_email,
    u_password,
    u_birthday,
    u_profilePicture,
    u_status
  } = req.body;

  logger.logDebugMsg(
    `username: ${u_username}, first name: ${u_firstname}, last name: ${u_lastname}, email: ${u_email}, password: ${u_password}, birthday: ${u_birthday}`
  );

  // Verify the required data received
  if (
    !u_username ||
    !u_firstname ||
    !u_lastname ||
    !u_email ||
    !u_password ||
    !u_birthday
  ) {
    logger.logErrorMsg(`required data not retrieved`);
    return res.status(400).json({ reason: "required data not retrieved" });
  }

  try {
    const newUser = await authServices.registerUser({
      u_username,
      u_firstname,
      u_lastname,
      u_email,
      u_password,
      u_birthday,
      u_profilePicture,
      u_status,
    });
    logger.logInfoMsg(`user registered successfully`);
    return res.status(200).json({ user: newUser });
  } catch (err) {
    logger.logErrorMsg(`${err}`);
    return res.status(500).json({ reason: err.message });
  }
};

/**
 * @desc    Log in an existing user
 * @route   POST /api/auth/login
 * @access  Public
 * @param   {string} u_username - The username of the user
 * @param   {string} u_password - The password of the user
 * @returns {object} - The authenticated user object along with a tokens
 * @throws  {Error} - If the email or password is incorrect
 * @throws  {Error} - If the required data is not provided
 * @throws  {Error} - If the user is not found
 * @throws  {Error} - If the password is incorrect
 */
exports.login = async (req, res) => {
  logger.logInfoMsg(`${req.ip} is trying to login`);

  const { u_username, u_password } = req.body;

  logger.logDebugMsg(`username: ${u_username}, password: ${u_password}`);

  // Verify the required data received
  if (!u_username || !u_password) {
    logger.logErrorMsg(`required data not provided`);
    return res.status(400).json({ reason: "required data not retrieved" });
  }

  try {
    const { user, accessToken, refreshToken } = await authServices.loginUser({
      u_username,
      u_password,
    });
    logger.logInfoMsg(`user logged successfully`);
    return res.status(200).json({ user: user, accessToken: accessToken, refreshToken: refreshToken });
  } catch (err) {
    logger.logErrorMsg(`${err}`);
    return res.status(500).json({ reason: err.message });
  }
};

/**
 * @desc    Refresh the access token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 * @param   {string} refreshToken - The refresh token of the user
 * @returns {object} - The new access token and refresh token
 * @throws  {Error} - If the required data is not provided
 * @throws  {Error} - If the refresh token is invalid
 */
exports.refreshToken = async (req, res) => {
  logger.logInfoMsg(`${req.ip} is trying to refresh token`);

  const { refreshToken } = req.body;

  logger.logDebugMsg(`refreshToken: ${refreshToken}`);

  // Verify the required data received
  if (!refreshToken) {
    logger.logErrorMsg(`required data not provided`);
    return res.status(400).json({ reason: "required data not retrieved" });
  }

  try {
    const decoded = await authServices.verifyRefreshToken(refreshToken);
    const tokens = await authServices.generateTokens(decoded.id);

    logger.logInfoMsg(`token refreshed successfully`);
    return res.status(200).json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
  } catch (err) {
    logger.logErrorMsg(`failed to refresh token: ${err}`);
    return res.status(500).json({ reason: "invalid refresh token" });
  }
};