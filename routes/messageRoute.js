const express=require('express')
const router=express.Router();
const {auth}=require('../middleware/auth')
const { sendMessage, getMessage, editMessage, getAllConversations,translateMessage } = require('../controllers/MessageController');

router.post('/send/:receiverId',auth,sendMessage)
router.post('/edit/:messageId',auth,editMessage);
router.get('/getconversations',auth,getAllConversations)
router.get('/:receiverId',auth,getMessage)
router.post('/translate',auth,translateMessage)

module.exports=router
