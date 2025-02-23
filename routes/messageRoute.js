const express=require('express')
const router=express.Router();
const {auth}=require('../middleware/auth')
const { sendMessage, getMessage, editMessage } = require('../controllers/MessageController');

router.post('/send/:receiverId',auth,sendMessage)
router.post('/edit/:messageId',auth,editMessage);

router.get('/:receiverId',auth,getMessage)

module.exports=router
