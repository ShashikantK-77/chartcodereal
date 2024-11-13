const { User } = require('../models');

const createUser = async (userData) => {
    return User.create(userData);
};

const getUserById = async (id) => {
    return User.findByPk(id);
};

const getAllUsers = async () => {
    return User.findAll();
};

module.exports = {
    createUser,
    getUserById,
    getAllUsers
};
