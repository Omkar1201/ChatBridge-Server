const express = require('express');
const app = express();
const { Server } = require('socket.io');
const http = require('http');
const authenticateSocket = require('../middleware/socketAuth'); // Import the middleware
const User = require('../models/User')

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true
    }
});

const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId]
}

const userSocketMap = {};

io.use(authenticateSocket);

io.on("connection", (socket) => {

    console.log(`Socket id: ${socket.id} with userId: ${socket.userId}`);
    const userId = socket.userId;
    if (userId != undefined) {
        userSocketMap[userId] = socket.id;
    }
    
    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    socket.on('disconnect', async () => {
        if (userId) {
            delete userSocketMap[userId];
            io.emit('getOnlineUsers', Object.keys(userSocketMap));
        }

        const lastSeen = new Date();
        try {
            await User.findByIdAndUpdate(socket.userId, { lastSeen });
        } catch (error) {
            console.log("Error updating lastSeen on disconnect:", error.message);
        }
        io.emit('lastseen', { userId: socket.userId, lastSeen });

        console.log(`User ${socket.userId} disconnected at ${lastSeen}`);

    })

    // socket.on("sendMessage", (data) => {
    // console.log(`Message received: ${data.message} from userId: ${socket.userId}`);
    // socket.broadcast.emit("receiveMessage", data);
    // });
});


module.exports = { app, server, io, express, getReceiverSocketId };
