const OrderModel = require('../dal/models/OrderModel');
const UserStrategyModel = require('../dal/models/UserStrategyModel');

// Controller function to update order_result_status and execution_status
const updateOrderAndStrategyStatus = async (req, res) => {
  const { strategy_id } = req.body;

  if (!strategy_id) {
    return res.status(400).json({ message: 'strategy_id is required.' });
  }

  try {
    // Update order_result_status to 'closed' in the orders table
    const orderUpdateResult = await OrderModel.update(
      { order_result_status: 'closed' },
      { where: { strategy_id } }
    );

    // Update execution_status to 'executed' in the user_strategies table
    const strategyUpdateResult = await UserStrategyModel.update(
      { execution_status: 'waiting' },
      { where: { strategy_id } }
    );

    if (orderUpdateResult[0] === 0 || strategyUpdateResult[0] === 0) {
      return res.status(404).json({ message: 'No matching strategy found.' });
    }

    res.status(200).json({
      message: 'Order and strategy statuses updated successfully.',
      orderUpdateResult,
      strategyUpdateResult,
    });
  } catch (error) {
    console.error('Error updating order or strategy:', error);
    res.status(500).json({ message: 'An error occurred while updating the status.', error });
  }
};

module.exports = { updateOrderAndStrategyStatus };  
