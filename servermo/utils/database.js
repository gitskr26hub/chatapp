const mongoose=require("mongoose");


async function connectionToDB(){
  try{
    const options = { 
      useNewUrlParser: true, 
      useUnifiedTopology: true, 
     }; 
    // console.log(process.env.mongoURL)
   await mongoose.connect(process.env.mongoURL)
          
   console.log("Connected to DB!"); 
       
   

  }catch(err){
    console.log("error to connect DB",err);
    process.exit(1);
  }
}

module.exports=connectionToDB