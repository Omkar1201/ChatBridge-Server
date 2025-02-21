const express=require('express')
const router=express.Router();
const {auth}=require('../middleware/auth')
const {signup,login}=require('../controllers/Auth')
const {getOtherUsers,logOut}=require('../controllers/UserController');

router.get('/',auth,getOtherUsers)

router.post('/signup',signup)
router.post('/signin',login)

router.get('/logout',logOut)


module.exports=router