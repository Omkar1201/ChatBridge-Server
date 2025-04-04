const mongoose = require('mongoose')
const User = require('./User')

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isEdited:{
        type:Boolean,
        default:false
    }
}, { timestamps: true }
);
module.exports = mongoose.model("Message", messageSchema)