const express = require("express");
const chatController = require("../controllers/chatController");
const verifyUserAccess = require("../middlewares/verifyUserAccess");
const router = express.Router();

router.get(
  "/messages/:chatId",
  verifyUserAccess,
  chatController.getChatMessages
);

module.exports = router;
