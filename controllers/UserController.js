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

const editUserProfile = async (req, res) => {
    try {
        const { fullName, username, email, profilePhoto, bio } = req.body
        
        const userId = req.user.userId
        const updatedUserData = await User.findByIdAndUpdate(userId, { fullName, username, email, profilePhoto, bio }, { new: true }).select('-password')
        
        return res.status(200).json({
            success: true,
            updatedUserData,
            message: "Profile updated successfully!"
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = { getOtherUsers, logOut, editUserProfile }