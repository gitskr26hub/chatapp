const sequelize = require("../utils/database");
const { Sequelize, DataTypes,Model } = require("sequelize");

const UserModel=require("./userModel")


class MessagesModel extends Model {}
MessagesModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      message:{  type: DataTypes.TEXT, allowNull: false,},
      senderId:{  type: DataTypes.STRING, allowNull: false,},

      // senderId:{  type: DataTypes.STRING, allowNull: false,},

      recieverId:{  type: DataTypes.STRING, allowNull: false,},
     
    },
    {
      sequelize,
      modelName: 'Messages',

    }
  );
  

MessagesModel.hasMany(UserModel);
UserModel.belongsTo(MessagesModel);





module.exports=MessagesModel