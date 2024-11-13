// models/IndicatorSetting.js

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../config/database'); // Adjust the path as necessary

class IndicatorSetting extends Model {}

IndicatorSetting.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
       
    },
    indicator_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    parameter_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    parameter_value: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updated_at'
    }
}, {
    sequelize,
    modelName: 'IndicatorSetting',
    tableName: 'indicator_settings',
    timestamps: false, // Set to true if you want Sequelize to manage createdAt/updatedAt
});

// Optionally, you can define hooks for automatic timestamps if not using Sequelize's timestamps
IndicatorSetting.beforeCreate((setting) => {
    setting.created_at = new Date();
    setting.updated_at = new Date();
});

IndicatorSetting.beforeUpdate((setting) => {
    setting.updated_at = new Date();
});

module.exports = IndicatorSetting;
