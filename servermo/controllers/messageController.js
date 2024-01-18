// const UserModel = require("../models/userModel");
const MessagesModel = require("../models/messageModel");

const connectToDB = require("../utils/database");

const addMessage = async (req, res) => {
  try {
    await connectToDB();

    const { from, to, message } = req.body;
    // console.log("======>>>>>", from, to, message);

    if (!from || !to || !message)
      throw "Error !! Please send full details...!!";

    const data = await MessagesModel.create({
      message: message,
      senderId: from,
      recieverId: to,
    });

    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (err) {
    console.log(err);
    return res.status(401).json({ msg: "ERROR", err: err });
  }
};

const getMessages = async (req, res) => {
  try {
    await connectToDB();
    const { from, to } = req.body;
    // console.log(from, to);
    if (!from || !to) throw "Error !! Please send full details...!!";

    const messages = await MessagesModel.find({
      $or: [
        { $and: [{ senderId: from }, { recieverId: to }] },
        { $and: [{ senderId: to }, { recieverId: from }] },
      ],
    })
      .sort({ createdAt: "asc" })
      .exec();

    // console.log("messages====>", messages);

    return res.status(201).json({ data: messages, messages: true });
  } catch (err) {
    console.log(err);
    return res.status(401).json({ msg: "ERROR", err: err });
  }
};

module.exports = { getMessages, addMessage };
