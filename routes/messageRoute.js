const express=require('express')
const router=express.Router();
const {auth}=require('../middleware/auth')
const { sendMessage, getMessage } = require('../controllers/MessageController');

router.post('/send/:receiverId',auth,sendMessage)
router.get('/:receiverId',auth,getMessage)

module.exports=router
