const UserStrategyModel = require('../dal/models/UserStrategyModel');
const StrategySymbolModel = require('../dal/models/StrategySymbolModel'); // Adjusted path
const StrategyIndicatorModel = require('../dal/models/StrategyIndicatorModel');
const StrategyActionModel = require('../dal/models/StrategyActionModel');
// Removed IndicatorMasterModel import

// async function getActiveStrategies() {
//   try {
//     const strategies = await UserStrategyModel.findAll({
//       where: { is_active: true },
//       raw: true
//     });

//     const combinedData = await Promise.all(
//       strategies.map(async strategy => {
//         const symbols = await StrategySymbolModel.findAll({
//           where: { strategy_id: strategy.strategy_id },
//           raw: true
//         });

//         const indicators = await StrategyIndicatorModel.findAll({
//           where: { strategy_id: strategy.strategy_id },
//           raw: true // Removed include clause
//         });

//         const actions = await StrategyActionModel.findAll({
//           where: { strategy_id: strategy.strategy_id },
//           raw: true
//         });

//         return {
//           strategy: {
//             strategy_id: strategy.strategy_id,
//             strategy_name: strategy.strategy_name,
//             description: strategy.description,
//             symbol: symbols.map(sym => sym.symbol).join(', '),
//             exchange: symbols.map(sym => sym.exchange).join(', '),
//             category: symbols.map(sym => sym.category).join(', '),
//             is_active: strategy.is_active,
//             status: strategy.execution_status,
//             last_execution_date: strategy.date
//           },
//           indicators: indicators.map(ind => ({
//             indicator_id: ind.indicator_id, // Use indicator_id directly
//             strategy_id: ind.strategy_id,
//             param_name: ind.param_name,
//             param_value: ind.param_value
//           })),
//           actions: actions.map(action => ({
//             action_id: action.str_act_id,
//             strategy_id: action.strategy_id,
//             action_name: action.action,
//             action_type: action.order_type,
//             BracketPriceAt: action.bracket_price_at,
//             BracketStopLoss: action.bracket_stop_loss,
//             BracketTarget: action.bracket_target,
//             TriggerPriceAt: action.trigger_price_at,
//             TriggerTriggerPrice: action.trigger_trigger_price,
//             LimitPrice: action.limit_price,
//             CoverPrice: action.cover_price,
//             CoverStopLoss: action.cover_stop_loss,
//             CoverTriggerPrice: action.cover_trigger_price,
//             StartTime: action.start_date,
//             EndTime: action.end_date,
//             executionCount: action.execution_count
//           }))
//         };
//       })
//     );

//     return combinedData;
//   } catch (error) {
//     throw new Error(`Error fetching combined strategy data: ${error.message}`);
//   }
// }




// async function getActiveStrategies() {
//   try {
//     const strategies = await UserStrategyModel.findAll({
//       where: { is_active: true },
//       raw: true
//     });

//     const combinedData = await Promise.all(
//       strategies.map(async (strategy) => {
//         const symbols = await StrategySymbolModel.findAll({
//           where: { strategy_id: strategy.strategy_id },
//           raw: true
//         });

//         const indicators = await StrategyIndicatorModel.findAll({
//           where: { strategy_id: strategy.strategy_id },
//           raw: true
//         });

//         const actions = await StrategyActionModel.findAll({
//           where: { strategy_id: strategy.strategy_id },
//           raw: true
//         });

//         return {
//           strategy: {
//             strategy_id: strategy.strategy_id,
//             strategy_name: strategy.strategy_name,
//             description: strategy.description,
//             symbol: symbols.map((sym) => sym.symbol).join(', '),
//             exchange: symbols.map((sym) => sym.exchange).join(', '),
//             category: symbols.map((sym) => sym.category).join(', '),
//             is_active: strategy.is_active,
//             status: strategy.execution_status,
//             last_execution_date: strategy.date
//           },
//           indicators: indicators.map((ind) => ({
//             indicator_id: ind.indicator_id, // Use indicator_id directly
//             strategy_id: ind.strategy_id,
//             param_name: ind.param_name,
//             param_value: ind.param_value
//           })),
//           actions: actions.map((action) => ({
//             action_id: action.str_act_id,
//             strategy_id: action.strategy_id,
//             action_name: action.action,
//             action_type: action.order_type,
//             target_percent: action.target_percent,
//             stoploss_percent:action.stoploss_percent,
//             BracketPriceAt: action.bracket_price_at,
//             BracketStopLoss: action.bracket_stop_loss,
//             BracketTarget: action.bracket_target,
//             TriggerPriceAt: action.trigger_price_at,
//             TriggerTriggerPrice: action.trigger_trigger_price,
//             LimitPrice: action.limit_price,
//             CoverPrice: action.cover_price,
//             CoverStopLoss: action.cover_stop_loss,
//             CoverTriggerPrice: action.cover_trigger_price,
//             StartTime: action.start_date,
//             EndTime: action.end_date,
//             executionCount: action.execution_count,
//             operationcount: action.operationcount

//           }))
//         };
//       })
//     );

//     return combinedData;
//   } catch (error) {
//     throw new Error(`Error fetching combined strategy data: ${error.message}`);
//   }
// }
async function getActiveStrategies() {
  try {
    // Fetch all active strategies
    const strategies = await UserStrategyModel.findAll({
      where: { is_active: true },
      raw: true
    });

    // Filter strategies to exclude those where all actions meet the exclusion criteria
    const validStrategies = await Promise.all(
      strategies.map(async (strategy) => {
        // Fetch actions for the current strategy
        const actions = await StrategyActionModel.findAll({
          where: { strategy_id: strategy.strategy_id },
          raw: true
        });

        // Check if all actions meet the exclusion criteria
        const allActionsMeetCriteria = actions.every(action => {
          return action.execution_count === action.operationcount ||
                 action.operationcount > action.execution_count;
        });

        if (!allActionsMeetCriteria) {
          return strategy; // Include strategy if not all actions meet the criteria
        }

        return null; // Exclude strategy if all actions meet the criteria
      })
    );

    // Remove null values (strategies that were excluded)
    const validStrategiesFiltered = validStrategies.filter(strategy => strategy !== null);

    // Fetch detailed data for each valid strategy
    const combinedData = await Promise.all(
      validStrategiesFiltered.map(async (strategy) => {
        const symbols = await StrategySymbolModel.findAll({
          where: { strategy_id: strategy.strategy_id },
          raw: true
        });

        const indicators = await StrategyIndicatorModel.findAll({
          where: { strategy_id: strategy.strategy_id },
          raw: true
        });

        const actions = await StrategyActionModel.findAll({
          where: { strategy_id: strategy.strategy_id },
          raw: true
        });

        return {
          strategy: {
            strategy_id: strategy.strategy_id,
            strategy_name: strategy.strategy_name,
            description: strategy.description,
            symbol: symbols.map((sym) => sym.symbol).join(', '),
            exchange: symbols.map((sym) => sym.exchange).join(', '),
            category: symbols.map((sym) => sym.category).join(', '),
            is_active: strategy.is_active,
            status: strategy.execution_status,
            last_execution_date: strategy.date
          },
          indicators: indicators.map((ind) => ({
            indicator_id: ind.indicator_id,
            strategy_id: ind.strategy_id,
            param_name: ind.param_name,
            param_value: ind.param_value
          })),
          actions: actions.map((action) => ({
            action_id: action.str_act_id,
            strategy_id: action.strategy_id,
            action_name: action.action,
            action_type: action.order_type,
            target_percent: action.target_percent,
            stoploss_percent: action.stoploss_percent,
            BracketPriceAt: action.bracket_price_at,
            BracketStopLoss: action.bracket_stop_loss,
            BracketTarget: action.bracket_target,
            TriggerPriceAt: action.trigger_price_at,
            TriggerTriggerPrice: action.trigger_trigger_price,
            LimitPrice: action.limit_price,
            CoverPrice: action.cover_price,
            CoverStopLoss: action.cover_stop_loss,
            CoverTriggerPrice: action.cover_trigger_price,
            StartTime: action.start_date,
            EndTime: action.end_date,
            executionCount: action.execution_count,
            operationcount: action.operationcount
          }))
        };
      })
    );

    return combinedData;
  } catch (error) {
    throw new Error(`Error fetching combined strategy data: ${error.message}`);
  }
}



module.exports = { getActiveStrategies };
