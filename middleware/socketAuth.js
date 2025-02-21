const jwt = require("jsonwebtoken");
// const cookie = require('cookie');

const authenticateSocket = (socket, next) => {
    try {
        const token = socket.handshake.headers['authorization']?.split(' ')[1] || socket.handshake.auth?.token || socket.handshake.headers.cookie.replace("authToken=", "");

        if (!token) {
            return next(new Error("Authentication token not found"));
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = payload.userId; // Store the userId for future use
        next(); // Proceed to the next middleware or event handler
    } catch (error) {
        console.log("Authentication failed:", error.message);
        next(new Error("Authentication failed"));
    }
};

module.exports = authenticateSocket;
