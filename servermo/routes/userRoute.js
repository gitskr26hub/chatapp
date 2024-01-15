const router=require("express").Router()
const {Login,Register,SetAvatar, LogOut, getAllUsers} =require("../controllers/userController")

const AuthMiddleware=require("../middlewares/authMidd")

router.post("/register",Register);

router.post("/login",Login);

router.post("/setavatar",AuthMiddleware,SetAvatar);

router.get("/getallusers",AuthMiddleware,getAllUsers);

router.post("/logout",AuthMiddleware,LogOut);


module.exports=router