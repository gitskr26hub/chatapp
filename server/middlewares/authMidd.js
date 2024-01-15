const {verifyAccessToken}=require("../utils/Token")

const UserModel = require("../models/userModel");

const AuthMiddleware=async(req,res,next)=>{
    const token =req?.headers?.authorization;

    // console.log(token)

    try{
        if(!token) throw "ERROR !! INVALID USER !!";
       
       const {success,data}= verifyAccessToken(token)
       if(success){
        const finduser=   await UserModel.findOne({where:{id:data.id}});

        if(!token==finduser.token && finduser.token!==null)throw "ERROR !! LOGIN AGAIN !!";

         req.user=data;
            // console.log(req.user,data)
         next();
       }
       else{
        throw "ERROR !! INVALID USER !!";
       }

    }catch(err){
        console.log(err)
        return  res.status(401).json({msg:"ERROR",err})
    }
}

module.exports=AuthMiddleware