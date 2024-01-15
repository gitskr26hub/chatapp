const Sequelize = require("sequelize");

const sequelize = new Sequelize("ecomm", "sa", "123456", {
  dialect: "mssql",
  host: "localhost",
  port: "1433", // Default port 53558
  logging: false, // disable logging; default: console.log

  dialectOptions: {
    requestTimeout: 30000, // timeout = 30 seconds
  },
});

// const sequelize = new Sequelize("PESData", "sa", "omsai#55",{
//     dialect:"mssql",
//     host: "www.pesonline.in",
//     port: "1433", // Default port 53558
//     logging: false, // disable logging; default: console.log

//     dialectOptions: {
//         requestTimeout: 30000 // timeout = 30 seconds
//     }

// })

module.exports = sequelize;
