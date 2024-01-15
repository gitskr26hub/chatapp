// const connectionToDB = require("../utils/database");
const mongoose = require("mongoose");

const { Schema } = mongoose;

const MessagesSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  recieverId: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
 
},{ timestamps: true }, { versionKey: false });

const MessagesModel = mongoose.model("Messages", MessagesSchema);

module.exports = MessagesModel;


