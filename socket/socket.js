const express = require('express');
const app = express();
const { Server } = require('socket.io');
const http = require('http');
const authenticateSocket = require('../middleware/socketAuth'); // Import the middleware

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true 
    }
});

const getReceiverSocketId=(receiverId)=>{
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

    socket.on('disconnect', () => {
        console.log('User disconnected: ', socket.id);
        if (userId) {
            delete userSocketMap[userId];
            io.emit('getOnlineUsers', Object.keys(userSocketMap));
        }
    })

    // socket.on("sendMessage", (data) => {
        // console.log(`Message received: ${data.message} from userId: ${socket.userId}`);
        // socket.broadcast.emit("receiveMessage", data);
    // });
});


module.exports = { app, server, io, express,getReceiverSocketId };
