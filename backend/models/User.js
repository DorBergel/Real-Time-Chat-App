const mongoose = require("mongoose");
const Chat = require("./Chat");
const userSchema = mongoose.Schema(
  {
    first_name: {
      type: String,
      require: true,
      unique: false,
    },
    last_name: {
      type: String,
      require: true,
      unique: false,
    },
    username: {
      type: String,
      require: true,
      unique: true,
    },
    hashed_password: {
      type: String,
      require: true,
      unique: false,
    },
    birthday: {
      //Y-M-D
      type: Date,
      require: true,
      unique: false,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    contacts: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      require: false,
      unique: false,
    },
    chats: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Chat",
      require: false,
      unique: false,
    },
    profilePicture: {
      type: String,
      require: false,
      unique: false,
      default: "default_profile_picture.jpeg",
    },
    status: {
      type: String,
      require: false,
      unique: false,
      default: "Hey there! I am using ChatApp.",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
