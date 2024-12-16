// // config/database.js
// const { Sequelize } = require('sequelize');
// require('dotenv').config();

// const sequelize = new Sequelize(
//   process.env.DATABASE,
//   process.env.USER,
//   process.env.PASSWORD,

//   {
//     host: process.env.HOST,
//     port: process.env.PGPORT,
//     dialect: 'postgres',
//     dialectOptions: {
//       ssl: {
//         require: false,
//         rejectUnauthorized: false, // Set to true if you have a valid SSL certificate
//       },
//     // dialectOptions: {
//     //   ssl: false // Disable SSL
  
//     },
//   }
// );





// module.exports = sequelize;




// const { Sequelize } = require('sequelize');
// require('dotenv').config();

// const sequelize = new Sequelize(
//   process.env.DATABASE,
//   process.env.USER,
//   process.env.PASSWORD,

//   {
//     host: process.env.HOST,
//     port: process.env.PGPORT,
//     dialect: 'postgres',
//     dialectOptions: {
//       // ssl: {
//       //   require: false,
//       //   rejectUnauthorized: false, // Set to true if you have a valid SSL certificate
//       // },
//     // dialectOptions: {
//     //   ssl: false // Disable SSL
  
//     },
//   },

//   pool: {
//     idleTimeoutMillis: 30000,  // Increase this value to 30 seconds (default is 10000ms)
//     connectionTimeoutMillis: 2000,  // Increase connection timeout to 2 seconds (default is 2000ms)
//   },
// );


const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.USER,
  process.env.PASSWORD,
  {
    host: process.env.HOST,
    port: process.env.PGPORT,
    dialect: 'postgres',
    dialectOptions: {
      // ssl: {
      //   require: false,
      //   rejectUnauthorized: false, // Set to true if you have a valid SSL certificate
      // },
    },
    pool: {
      idleTimeoutMillis: 30000,  // Increase this value to 30 seconds (default is 10000ms)
      connectionTimeoutMillis: 2000,  // Increase connection timeout to 2 seconds (default is 2000ms)
    },
  }
);

module.exports = sequelize;





module.exports = sequelize;