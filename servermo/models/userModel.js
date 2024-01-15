

const { default: mongoose } = require("mongoose");


const UserSchema = new mongoose.Schema({
    username: {
      type:String,
      required: true,
      unique:true
    },
    mobile: {
     type: String,
     required: true,
     unique:true
      // unique: true, // Make the username column unique
    },
    mobilecode: {
     type: String,
     required: true,
     
      // unique: true, // Make the username column unique
    },
    email: {
      type: String,
      required: true,
      unique:true
      // unique: true, // Make the email column unique
    },
    password: {
      type: String,
     required: true
    },
    avatar: {
      type:String,
   
    },
    token: {
      type:String,
    },
  },{ timestamps: true },
  { versionKey: false });
  
const UserModel = mongoose.model('users', UserSchema);
  



module.exports=UserModel



