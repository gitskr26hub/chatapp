const UserModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const { Op, QueryTypes } = require("sequelize");
const {generateAccessToken}=require("../utils/Token");
const sequelize = require("../utils/database");

const Login = async (req, res, next) => {
  console.log(req?.body)

  const { emailorusername, password } = req.body;
 
  try {
    if (!emailorusername || !password){
      throw "ERROR !! Please send all details !!";}

    const findUser=await  UserModel.findOne({where:{
        [Op.or]: [{ username: emailorusername }, { email: emailorusername },{mobile:emailorusername}],
    }})
    if(findUser){
        bcrypt.compare(password, findUser.password,async function(err, result) {
            if(result){

            
             const token= generateAccessToken({id:findUser.id,username:findUser.username})
               
            await UserModel.update({token:token},{
                  where:{id:findUser.id}
                })

            return res.status(201).json({status:true,msg:"Login Successful",token,username:findUser.username,id:findUser.id,avatarImage:findUser.avatar
              })
            }
            else{
                return res.json({status:false,msg:"Login Failed"})
            }
        });

    }
    else{
      return  res.json({status:false,msg:"User does not exist ! please register first !!"})
    }


  } catch (err) {
    console.log(err);
    return res.status(401).json({ msg: "ERROR", status: false, err: err });
  }
};

const Register = async (req, res, next) => {
  const { username, password, email ,mobile,mobilecode} = req.body;

  try {
    if (!username || !password || !email || !mobile && !mobilecode)
      throw "ERROR !! Please send all details !!";
      const usernamecheck = await UserModel.findOne({   where: { username: username  },  });
      if(usernamecheck){return res.json({  msg: "Username already exist", status: false, });}

    const EmailCheck = await UserModel.findOne({
      where:  { email: email }
    });
    if(EmailCheck){return res.json({  msg: "This Email already registered",  status: false,});}

    const mobilecheck = await UserModel.findOne({
      where:  { mobile: mobile }
    });
    if (mobilecheck) { return res.json({  msg: "Mobile No. already Registered !!",     status: false,   });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await UserModel.create({
        email,
        mobile,
        mobilecode,
        username,
        password: hashedPassword,
      });
      delete user.password;
      return res.status(201).json({ status: true, user });
    }
  } catch (err) {
    console.log(err);
    return res.status(401).json({ msg: "ERROR", status: false, err: err });
  }
};

const SetAvatar=async(req,res)=>{
    const user=req.user;
    // console.log("user",user,req.body);
  try {
    const {image}=req.body
     if(!image) throw "ERROR !! NO IMAGE !!";

      const findUser=await UserModel.update({avatar:image},
        {
          where:{id:user.id}
        })

       return res.status(201).json({msg:"Successfully Updated Avatar",status:true,image:image})

   
  } catch (err) {
    console.log(err);
    return res.status(401).json({ msg: "ERROR", status: false, err: err });
  }
}

const LogOut=async(req,res)=>{
  const user=req.user;
  
  try{
     await UserModel.update({token:null},{
      where:{id:user.id}
     })
     return res.status(201).json({msg:"successfully logout",status:200})

  }catch(err){
    console.log(err);
    return res.status(401).json({msg:"ERROR",err:err})
  }
}

const getAllUsers=async(req,res)=>{
 const user=req.user
  
  try{
   const data=  await sequelize.query(`select id,email,username,avatar as avatarImage

   from ecomm.dbo.users where id!='${user.id}'`,{type:QueryTypes.SELECT})
   
   
    return res.status(201).json({msg:"successfully logout",status:true,data:data})

  }catch(err){
    console.log(err);
    return res.status(401).json({msg:"ERROR",err:err})
  }
}



module.exports = { Login, Register,SetAvatar,LogOut ,getAllUsers};
