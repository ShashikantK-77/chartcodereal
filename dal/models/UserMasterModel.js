// models/UserMaster.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database'); // Adjust the path as needed

const UserMaster = sequelize.define('UserMaster', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  email_id: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  mobile_no: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  register_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  is_locked: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  gender: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  pincode: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  area: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  city: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  state: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'user_master',
  timestamps: false,
});

module.exports = UserMaster;
