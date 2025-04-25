const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: './User.js',
        require: true
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: './Chat.js',
        require: true
    },
    seen: {
        type: Boolean,
        require: false,
        default: false
    },
    content: {
        type: String,
        require: true
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);