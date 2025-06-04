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
      default: null
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Chat", chatSchema);
