const authServices = require("../services/authService");
const logger = require("../utils/logger");

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
    });
    logger.logInfoMsg(`user registered successfully`);
    return res.status(200).json({ user: newUser });
  } catch (err) {
    logger.logErrorMsg(`${err}`);
    return res.status(500).json({ reason: err.message });
  }
};

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
    const { user, token } = await authServices.loginUser({
      u_username,
      u_password,
    });
    logger.logInfoMsg(`user logged successfully`);
    return res.status(200).json({ user: user, token: token });
  } catch (err) {
    logger.logErrorMsg(`${err}`);
    return res.status(500).json({ reason: err.message });
  }
};
