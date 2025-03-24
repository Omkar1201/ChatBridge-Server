const Conversation = require('../models/Conversation')
const Message = require('../models/Message')
const { io, getReceiverSocketId } = require('../socket/socket')
const axios = require('axios')
require('dotenv').config();

const sendMessage = async (req, res) => {
    try {
        const senderId = req.user.userId;
        const receiverId = req.params.receiverId;
        const { message } = req.body;

        let gotConversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (!gotConversation) {
            gotConversation = await Conversation.create({
                participants: [senderId, receiverId]
            });
        }

        const newMessage = await Message.create({ senderId, receiverId, message });

        if (newMessage) {
            gotConversation.messages.push(newMessage._id);
        }

        await Promise.all([gotConversation.save(), newMessage.save()]);

        // Populate the messages before emitting
        await gotConversation.populate('messages');

        // Socket io
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newOrUpdatedConversation", gotConversation);
        }

        return res.status(201).json({
            success: true,
            gotConversation,
            message: "Message sent successfully!"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

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
const getAllConversations = async (req, res) => {
    try {
        const { userId } = req.user;
        const conversations = await Conversation.find({ participants: userId }).populate('messages');
        return res.status(200).json({
            success: true,
            conversations,
            message: "conversations retrived successfully!"
        })
    }
    catch (error) {
        console.error("Error editing message:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}
const editMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const { messageId } = req.params
        const { userId } = req.user;

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

        return res.status(200).json({
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

const translateMessage = async (req, res) => {
    try {
        const { message,targetLanguage } = req.body;

        if (!message || typeof message !== 'string' || message.trim() === '') {
            throw new Error("Translation failed, No text received.");
        }

        const detectOptions = {
            method: 'POST',
            url: 'https://google-translate113.p.rapidapi.com/api/v1/translator/detect-language',
            headers: {
                'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                'x-rapidapi-host': 'google-translate113.p.rapidapi.com',
                'Content-Type': 'application/json',
            },
            data: { text: message }
        };

        const detectResponse = await axios.request(detectOptions);

        if (!detectResponse.data || !detectResponse.data.source_lang_code) {
            throw new Error("Unable to detect source language.");
        }

        const sourceLang = detectResponse.data.source_lang_code;
        
        const targetLang = sourceLang === 'en' ? targetLanguage : 'en';
        
        const translateOptions = {
            method: 'POST',
            url: 'https://google-translate113.p.rapidapi.com/api/v1/translator/text',
            headers: {
                'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                'x-rapidapi-host': 'google-translate113.p.rapidapi.com',
                'Content-Type': 'application/json'
            },
            data: {
                from: sourceLang,
                to: targetLang,
                text: message
            }
        };

        const translationResponse = await axios.request(translateOptions);

        if (!translationResponse.data || !translationResponse.data.trans) {
            throw new Error("Translation failed. No translated text received.");
        }

        return res.status(200).json({
            success: true,
            message: "Message translated successfully.",
            translatedMessage: translationResponse.data.trans
        });

    } catch (error) {
            return res.status(500).json({
            success: false,
            message: `${error?.response?.data?.message || error.message}`
        });
    }
};


module.exports = { sendMessage, getMessage, editMessage, getAllConversations, translateMessage }