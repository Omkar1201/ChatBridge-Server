const jwt = require("jsonwebtoken");
// const cookie = require('cookie');

const authenticateSocket = (socket, next) => {
    try {
        const getTokenFromCookie = (cookieString) => {
            if (!cookieString) return null;
            const match = cookieString.match(/authToken=([^;]+)/);
            return match ? match[1] : null;
        };

        const token =
            socket.handshake.headers?.authorization?.split(' ')[1] ||
            socket.handshake.auth?.token ||
            getTokenFromCookie(socket.handshake.headers?.cookie) ||
            null;

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
