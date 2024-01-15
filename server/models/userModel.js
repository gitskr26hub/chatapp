const sequelize = require("../utils/database");
const { Sequelize, DataTypes,Model } = require("sequelize");
const crypto = require("crypto");

// const UserModel =  sequelize.define("users", {
//   id: {
//     type: DataTypes.STRING,
//     unique: true,
//     allowNull: false,
//     primaryKey: true,
//     // autoIncrement: true,
//     defaultValue: () => crypto.randomUUID(),
//   },
//   username: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     // unique: true,
//   },
//   email: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     // unique: true,
//   },
//   password: {
//     type: DataTypes.TEXT,
//     allowNull: false,
//   },
//   avatar:{
//     type: DataTypes.TEXT,
//   }

// });
class UserModel extends Model {}
UserModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        // unique: true, // Make the username column unique
      },
      mobile: {
        type: DataTypes.STRING,
        allowNull: false,
        // unique: true, // Make the username column unique
      },
      mobilecode: {
        type: DataTypes.STRING,
        allowNull: false,
        // unique: true, // Make the username column unique
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        // unique: true, // Make the email column unique
      },
      password: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      avatar: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      token: {
        type: DataTypes.TEXT,
     
      },
     
    },
    {
      sequelize,
      modelName: 'users',
      indexes: [
        {
          unique: true,
          fields: ['username'], // Create a unique index for the username column
        },
        {
          unique: true,
          fields: ['email'], // Create a unique index for the email column
        },
      ],
    }
  );
  


module.exports=UserModel