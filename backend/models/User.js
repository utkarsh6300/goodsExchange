const mongoose=require('mongoose');

const UserSchema =new mongoose.Schema({
    username:{
        type: String,
        required:true,
        unique: true
    },
    name:{
        type: String,
        required:true
    },
    email:{
        type: String,
        unique: true
    },
    phone:{
        type: Number,
        required:true,
        unique: true
    },
    password:{
        type:String,
        required: true
    },
    date:{
        type:Date,
        default:Date.now
    },
    verificationCode:{
        type:String,
        default:''
     },
     verificationCodeExpires:{
        type:Date,
        default:Date.now()+3600000
     },
     isVerified:{
        type:Boolean,
        default:false
     }
})


module.exports=User=mongoose.model('user',UserSchema);
