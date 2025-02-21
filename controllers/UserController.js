const User = require('../models/User')


const getOtherUsers = async (req, res) => {
    try {
        const loggedInUserId = req.user.userId;
        const otherUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
        return res.status(200).json(
            {
                success: true,
                otherUsers
            }
        )
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
const logOut = (req, res) => {
    try {
        res.clearCookie('authToken', {
            httpOnly: true,
            secure: false, // or true in production
            sameSite: "Lax",
            path: '/'
        });
        return res.status(200).json({
            success: true,
            message: "Logged out successfully!"
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = { getOtherUsers, logOut }