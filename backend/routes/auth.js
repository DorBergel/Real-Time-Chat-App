const express = require("express");
const authController = require("../controllers/authController");
const verifyUserAccess = require("../middlewares/verifyUserAccess");
const router = express.Router();

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
router.post("/register", authController.register);

/**
 * @desc    Log in an existing user
 * @route   POST /api/auth/login
 * @access  Public
 * @param   {string} u_email - The email of the user
 * @param   {string} u_password - The password of the user
 * @returns {object} - The authenticated user object along with a token
 * @throws  {Error} - If the email or password is incorrect
 * @throws  {Error} - If the required data is not provided
 */
router.post("/login", authController.login);

module.exports = router;
