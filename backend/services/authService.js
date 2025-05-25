const userValidation = require("../utils/userValidation");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { logDebugMsg } = require("../utils/logger");
require("dotenv").config({ path: "../config/.env" });



exports.generateTokens = async (userId) => {
  const accessToken = await jwt.sign({ id: userId }, process.env.JWT_SECRET, {expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN});
  const refreshToken = await jwt.sign({ id: userId }, process.env.JWT_SECRET, {expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN});

  logDebugMsg(
    `access token: ${accessToken}, refresh token: ${refreshToken}`
  );

  return { accessToken, refreshToken };
}

exports.verifyRefreshToken = async (refreshToken) => {
  try {
    const decoded = await jwt.verify(refreshToken, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    throw new Error("Invalid refresh token");
  }
}


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
*/
exports.registerUser = async ({
  u_username,
  u_firstname,
  u_lastname,
  u_email,
  u_password,
  u_birthday,
}) => {
  // Check if the username already taken or email already used
  const exists = await User.findOne({
    $or: [{ username: u_username }, { email: u_email }],
  }).lean();

  if (exists) {
    throw new Error("username or email are already exist");
  }

  // Ensure password strong enough
  if (!userValidation.passwordIsStrong(u_password)) {
    throw new Error("password is too weak");
  }

  // Ensure client is adult
  if (!userValidation.isAdult(u_birthday)) {
    throw new Error("user too young");
  }

  // Hash the password before store it to db
  const u_hashedPassword = await bcrypt.hash(
    u_password,
    parseInt(process.env.SALT_ROUNDS)
  );

  const newUserDocument = new User({
    first_name: u_firstname,
    last_name: u_lastname,
    username: u_username,
    email: u_email,
    hashed_password: u_hashedPassword,
    birthday: u_birthday,
  });

  await newUserDocument.save();

  return newUserDocument;
};

/** 
* @desc    Log in an existing user
* @route   POST /api/auth/login
* @access  Public
* @param   {string} u_username - The username of the user
* @param   {string} u_password - The password of the user
* @returns {object} - The authenticated user object along with a token
* @throws  {Error} - If the email or password is incorrect
* @throws  {Error} - If the required data is not provided
*/
exports.loginUser = async ({ u_username, u_password }) => {
  const user = await User.findOne({ username: u_username });

  if (!user) {
    throw new Error(`user not found`);
  }

  // Ensure provided password correctness
  console.log(`u_password: ${u_password} \t user.hashed_password: ${user}`);
  const isMatch = await bcrypt.compare(u_password, user.hashed_password);
  if (!isMatch) {
    throw new Error(`password is incorrect`);
  }

  // Generate the current user's tokens
  const { accessToken, refreshToken } = await this.generateTokens(user._id);
  

  logDebugMsg(
    `user ${user.username} logged in successfully, access token: ${accessToken}, refresh token: ${refreshToken}`
  );

  return { user: user, accessToken: accessToken, refreshToken: refreshToken };
};

