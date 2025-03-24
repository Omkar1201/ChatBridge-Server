const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const signup = async (req, res) => {
    try {
        let { fullName, username, email, password } = req.body
        if (!username || !email || !password || !fullName) {
            return res.status(400).json({ message: "All fields are required" })
        }
        fullName=fullName.trim(), username=username.trim(), email=email.trim(), password=password.trim() 
        const isUserPresent = await User.findOne({ username })
        // Check is user already present
        if (isUserPresent) {
            return res.status(409).json({
                success: false,
                message: 'User exist, Try another Username'
            })
        }

        // Hash password
        let hashedpassword;
        try {
            hashedpassword = await bcrypt.hash(password, 10);
        }
        catch (err) {
            return res.status(500).json({
                success: false,
                message: `Unable to hash the password ${err.message}`
            })
        }

        const userData = await User.create({ fullName, username, email, password: hashedpassword })
        return res.status(201).json({
            success: true,
            message: 'Sign up successfull!'
        })
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}
const login = async (req, res) => {
    try {
        let { username, password } = req.body

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required' });
        }
    
        username=username.trim()
        password=password.trim()
        
        const userData = await User.findOne({ username })
        if (!userData) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        // ispasswordmatched
        const ispasswordmatched = await bcrypt.compare(password, userData.password)
        if (ispasswordmatched) {

            const payload = {
                username: userData.username,
                email: userData.email,
                userId: userData._id
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' })
            const options = {
                httpOnly: true,         // Prevents JavaScript access
                secure: false,          //  Must be false for localhost (HTTPS required for true)
                sameSite: "Lax",        // Lax mode for cross-origin on same-site
                maxAge: 1000 * 60 * 60 * 24 * 30
            }

            const userWithoutPassword = userData.toObject();
            delete userWithoutPassword.password;

            return res.cookie('authToken', token, options).status(200).json({
                success: true,
                token,
                userData:userWithoutPassword,
                message: `Login successfull (Hi ${userData.username})`
            })
        }
        else {

            return res.status(401).json({
                success: false,
                message: 'Password does not match'
            })
        }
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}
module.exports = { signup, login }


