// controllers/availableBrokerController.js

const AvailableBrokerModel = require('../dal/models/Broker_Master'); // Adjust the path as needed

// Get all available brokers
exports.getAllAvailableBrokers = async (req, res) => {
    try {
        const brokers = await AvailableBrokerModel.findAll();
        res.status(200).json(brokers);
    } catch (error) {
        console.error('Error fetching brokers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get a specific broker by ID
exports.getAvailableBrokerById = async (req, res) => {
    const { id } = req.params;
    try {
        const broker = await AvailableBrokerModel.findByPk(id);
        if (broker) {
            res.status(200).json(broker);
        } else {
            res.status(404).json({ error: 'Broker not found' });
        }
    } catch (error) {
        console.error('Error fetching broker:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
