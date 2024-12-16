require('dotenv').config();

// module.exports = {
//     development: {
//         username: process.env.USER,
//         password: process.env.PASSWORD,
//         database: process.env.DATABASE,
//         host: process.env.HOST,
//         port: process.env.PORT,
//         dialect: 'postgres',
//         ssl: {
//             rejectUnauthorized: false // Set to true in production with a valid SSL certificate
//         }
//     }
// };


// module.exports = {
//     development: {
//       username: process.env.USER,
//       password: process.env.PASSWORD,
//       database: process.env.DATABASE,
//       host: process.env.HOST,
//       port: process.env.PGPORT,
//       dialect: 'postgres',
//       ssl: {
//         require: false, // Ensure SSL is required for cloud databases
//         rejectUnauthorized: false
//       },
//       pool: {
//         max: 5,
//         min: 0,
//         acquire: 60000,  // Increase acquire timeout to 60 seconds
//         idle: 10000
//       }
      
//     }
//   };



const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE, process.env.USER, process.env.PASSWORD, {
  host: process.env.HOST,
  dialect: 'postgres',
  port: process.env.PGPORT,
  ssl: {
    require: false, // Adjust based on your needs
    rejectUnauthorized: false
  }

  // dialectOptions: {
  //   ssl: false,  // Disable SSL
  // },

});

sequelize.authenticate()
  .then(() => {
    console.log('Connection established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });
