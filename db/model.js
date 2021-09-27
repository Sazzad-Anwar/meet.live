const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
    },
    socketId: {
        type: String,
        unique: true,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    roomId: {
        type: String,
    },
    isHost: {
        type: Boolean,
        default: false
    },
    isJoined: {
        type: Boolean,
        default: false
    },
    isLeft: {
        type: Boolean,
        default: false
    },
    isVideoMuted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const Users = mongoose.model('User', userSchema);

module.exports = Users;