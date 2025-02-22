const mongoose=require('mongoose')

const userSchema=new mongoose.Schema(
    {
        fullName:{
            type:String,
            required:true
        },
        username:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:true
        },
        profilePhoto:{
            type:String,
            default:""
        },
        lastSeen:{
            type:Date,
            default:null
        },
        bio:{
            type:String,
            default:"Message only"
        }
    },{timestamps:true}
)
module.exports=mongoose.model("User",userSchema)