import mongoose from 'mongoose'


const userSchema =  new mongoose.Schema({
    name:{
       type:String, 
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    chatsbyuser:{
        type:[String]
    },
    chatsbyai:{
        type:[String]
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
    
},{timestamps:true})

export default mongoose.model('User',userSchema);