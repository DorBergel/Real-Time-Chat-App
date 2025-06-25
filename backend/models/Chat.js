const mongoose = require("mongoose");

const chatSchema = mongoose.Schema(
  {
    isGroup: {
      type: Boolean,
      require: true,
      default: false,
    },
    participants: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "./User.js",
      require: true,
    },
    title: {
      type: String,
      require: true,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "./Message.js",
      require: false,
      default: null,
    },
    chatImage: {
      type: String,
      require: false,
      default: "default_profile_picture.jpeg",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Chat", chatSchema);
