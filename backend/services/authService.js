const userValidation = require("../utils/userValidation");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "../config/.env" });

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

  // Generate the current user's token
  const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  return { user: user, token: token };
};
