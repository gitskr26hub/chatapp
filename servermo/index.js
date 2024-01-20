const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectionToDB = require("./utils/database");
const socket = require("socket.io");

// const {createServer}=require("http")

//---------IMPORT ROUTES START------------;
const userRouter = require("./routes/userRoute");
const messageRoutes = require("./routes/messageRoute");
//---------IMPORT ROUTES END--------------;

const app = express();

app.use(cors({origin:"http://localhost:5173"}));

app.get("/", (req, res) => {
  res.send(`Server running on PORT ${process.env.PORT}`);
});



app.use(express.json());

app.use("/auth", userRouter);

app.use("/api/messages", messageRoutes);



const server = app.listen(process.env.PORT || 1306, () => {
  connectionToDB()
  console.log(`server is running on PORT ${process.env.PORT}`);
});



//***************************-----------------------******************************/
global.onlineUsers = new Map();
global.videoCallSockets = new Map(); // Map to store video call sockets

try{
  
  const io = socket(server, {
    cors: {
       origin: "http://localhost:5173",
      credentials: true,
    },
  
  });

  io.on("connection", (socket) => {
    global.chatSocket = socket;
  
    // console.log("socket",socket)
    // 
    socket.on("add-user", (userId) => {
      // console.log("userId  in socket====>",userId)
      onlineUsers.set(userId, socket.id);
      // console.log("onlineUsers==>", onlineUsers);
  
    });
  
    
   socket.on("isUserConnected",({ownID,anotherID})=>{
    //  console.log("ownID,anotherID==>",ownID,anotherID)
     const checkID = onlineUsers?.get(anotherID);
     const sendID= onlineUsers?.get(ownID);
    //  console.log("sendUserSocket",sendUserSocket)
  
     if(checkID){
        // console.log("yes is there",onlineUsers);
        
        socket.emit("getUserOnline", {"user":true});
  
      }else {
        // console.log("yes is NOT THERE",onlineUsers);
  
        socket.emit("getUserOnline", {"user":false});
      }
  
    })
  
    socket.on("isUserDisconnected",(userID)=>{
     
      onlineUsers.delete(userID)
       
      //  console.log(onlineUsers)
   })
    
  
  
    socket.on("send-msg", (data) => {
      const sendUserSocket = onlineUsers.get(data.to);
      const fromUser=onlineUsers.get(data.from);
     

      if(!fromUser){
        onlineUsers.set(data.from,socket.id)
        console.log("onlineUsers===>fromUser", onlineUsers);
      }

      if (sendUserSocket) {
        console.log("send-msg socket==>", data);

      
        
        socket.to(sendUserSocket).emit("msg-recieve", {message:data.message,createdAt:data.createdAt});
  
      }else if(!fromUser){
        onlineUsers.set(data.from, socket.id);
      }
      console.log("onlineUsers===>", onlineUsers);
    });
  
  //------------------video call---------
  socket.on("user:call", ({from, to, offer,name }) => {
    const anotherUserID=onlineUsers.get(to)
    const mySocketID=onlineUsers.get(from)
    console.log(mySocketID,to,offer,name);
    
    io.to(anotherUserID).emit("incomming:call", 
    { from: mySocketID, offer,name });
  });
  
  socket.on("call:accepted", ({ to, ans }) => {
    const anotherUserID=onlineUsers.get(to)

     io.to(anotherUserID).emit("call:accepted",
      { from: socket.id, ans });
  });


  socket.on("call:rejected", ({ to, msg,name }) => {
    const anotherUserID=onlineUsers.get(to)
    console.log(to, msg,name)
     io.to(anotherUserID).emit("call:rejected", {  msg,name });
  });


  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    const anotherUserID=onlineUsers.get(to)
    io.to(anotherUserID).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
  
    socket.on("disconnect", () => {
      // console.log('User disconnected:=====>>', socket.id,);
  
      for (const [key, value] of onlineUsers) {
        if (value === socket.id) {
          onlineUsers.delete(key);
          console.log(
            `Key "${key}" with value ${socket.id} deleted successfully.`
          );
        }
        // console.log("onlineUsers", onlineUsers);
      }
  
      let arr=[];
      for (const user of onlineUsers.keys()) {
        // console.log("user",user);
       arr.push(user);
      }
      socket.broadcast.emit("getAllOnlineUsers", arr);
  
  
  
    });


  });

}catch(err){
  console.log(err)
}
