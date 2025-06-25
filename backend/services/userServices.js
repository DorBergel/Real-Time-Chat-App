const { model } = require("mongoose");
const { path } = require("../app");
const Chat = require("../models/Chat");
const User = require("../models/User");
const { logDebugMsg } = require("../utils/logger");
const { populate } = require("dotenv");
require("dotenv").config({ path: "../config/.env" });

exports.getUserDocById = async (userId) => {
  const user = await User.findById(userId)
    .populate({
      path: "contacts",
      model: User,
      select: "_id username profilePicture status",
    })
    .populate({
      path: "chats",
      model: Chat,
      populate: [
        {
          path: "participants",
          model: User,
          select: "_id username profilePicture",
        },
        {
          path: "lastMessage",
          model: "Message",
          populate: {
            path: "author",
            model: User,
            select: "_id username",
          },
        },
      ],
    });

  logDebugMsg(`getUserDocById: userId: ${userId}, user: ${user}`);
  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

/*
  <Form.Group controlId="groupImage">
                <Form.Label>Group Image</Form.Label>
                <img
                  src={`${process.env.REACT_APP_API_URL}/uploads/profile-pictures/default_group_picture.jpeg`}
                  alt="Group"
                  className="group_image_preview"
                />
                <Form.Text className="text-muted">
                  Maximum file size: 5MB. Supported formats: JPEG, PNG, GIF
                </Form.Text>

                <Form.Control
                  type="input"
                  accept="image/jpeg,image/png,image/gif"
                  id="profileImage"
                  onChange={handleImageChange}
                />
              </Form.Group>
*/
