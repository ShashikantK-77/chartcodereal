// config/database.js
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
      ssl: {
        require: false,
        rejectUnauthorized: false, // Set to true if you have a valid SSL certificate
      },
    // dialectOptions: {
    //   ssl: false // Disable SSL
  
    },
  }
);





module.exports = sequelize;
