const { userRepository } = require('../dal/MainRepositories');

const createUser = async (req, res, next) => {
    try {
        const user = await userRepository.createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const user = await userRepository.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
};

const getAllUsers = async (req, res, next) => {
    try {
        const users = await userRepository.getAllUsers();
        res.json(users);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createUser,
    getUserById,
    getAllUsers
};
