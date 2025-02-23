const Conversation = require('../models/Conversation')
const Message = require('../models/Message')
const { io, getReceiverSocketId } = require('../socket/socket')

const sendMessage = async (req, res) => {
    try {
        const senderId = req.user.userId;
        const receiverId = req.params.receiverId;
        const { message } = req.body;

        let gotConversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        })

        if (!gotConversation) {
            gotConversation = await Conversation.create({
                participants: [senderId, receiverId]
            })
        }

        const newMessage = await Message.create({ senderId, receiverId, message })

        if (newMessage) {
            gotConversation.messages.push(newMessage._id)
        }
        await Promise.all([gotConversation.save(), newMessage.save()])
        // Socket io
        const receiverSocketId = getReceiverSocketId(receiverId);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }


        return res.status(201).json({
            success: true,
            newMessage,
            message: "Message send successfully!"
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const getMessage = async (req, res) => {
    try {
        const senderId = req.user.userId;
        const receiverId = req.params.receiverId;

        if (!receiverId) {
            return res.status(404).json({
                success: false,
                message: "Receiver not present"
            })
        }

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        }).populate('messages')

        if (!conversation) {
            return res.status(200).json({
                success: true,
                messages: [],
                message: "Conversation Not Found"
            })
        }

        return res.status(200).json({
            success: true,
            messages: conversation.messages,
            message: "Conversation Retrived!"
        })
    }
    catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const editMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const {messageId}=req.params
        const {userId} = req.user;        

        if (!messageId || !message?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message ID and content are required"
            });
        }

        const messageData = await Message.findById(messageId);
        if (!messageData) {
            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }
        
        if (messageData.senderId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to edit this message"
            });
        }

        messageData.message = message.trim();
        messageData.isEdited = true;
        await messageData.save();

        res.status(200).json({
            success: true,
            message: "Message updated successfully",
            updatedMessage: messageData
        });

    } catch (error) {
        console.error("Error editing message:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
module.exports = { sendMessage, getMessage,editMessage }