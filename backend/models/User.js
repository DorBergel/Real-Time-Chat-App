const mongoose = require("mongoose");

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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
