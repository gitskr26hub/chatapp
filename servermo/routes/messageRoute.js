const { addMessage, getMessages } = require("../controllers/messageController");
const router = require("express").Router();


const AuthMiddleware=require("../middlewares/authMidd")


router.post("/addmsg/",AuthMiddleware, addMessage);

router.post("/getmsg/",AuthMiddleware, getMessages);


module.exports = router;