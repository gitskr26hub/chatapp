// const UserModel = require("../models/userModel");
const MessagesModel = require("../models/messageModel");

const { Op, QueryTypes } = require("sequelize");

const sequelize = require("../utils/database");



const addMessage=async(req,res)=>{

    try{
     
    const { from, to, message } = req.body;

    const data = await MessagesModel.create({
        message:message,
        senderId:from,
        recieverId:to,
    });

    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });

    }catch(err){
        console.log(err);
        return res.status(401).json({msg:"ERROR",err:err})
    }
};


const getMessages=async(req,res)=>{

    try{
        const { from, to } = req.body;
    //    console.log(from,to)
        const messages = await MessagesModel.findAll({
         where:{
           [Op.or]:[{ senderId:from,  recieverId:to,},{ senderId:to,  recieverId:from,}]
         },
         order: [  ['createdAt', 'ASC'],],
        });

        // console.log("messages",messages)
    
       
      return  res.status(201).json({data:messages});

    }catch(err){
        console.log(err);
        return res.status(401).json({msg:"ERROR",err:err})
    }
}



module.exports={getMessages,addMessage};