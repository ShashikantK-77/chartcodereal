const express = require('express');
const router = express.Router();
const IndicatorSetting = require('../dal/models/IndicatorSettingModel'); // Adjust the path as needed



// API to create new indicator settings
// router.post('/indicator-settings', async (req, res) => {
//     console.log("indicator-settings input:",req.body);
    
//     const { customEma, customSma } = req.body;

//     try {
//         const settings = [];

//         if (customEma) {
//             settings.push({
//                 user_id: req.body.user_id, // Add user_id as needed
//                 indicator_name: 'customEma',
//                 parameter_name: 'enabled',
//                 parameter_value: customEma.enabled.toString(), // Store as string
//             });
//             settings.push({
//                 user_id: req.body.user_id,
//                 indicator_name: 'customEma',
//                 parameter_name: 'length',
//                 parameter_value: customEma.length.toString(),
//             });
//         }

//         if (customSma) {
//             settings.push({
//                 user_id: req.body.user_id,
//                 indicator_name: 'customSma',
//                 parameter_name: 'enabled',
//                 parameter_value: customSma.enabled.toString(),
//             });
//             settings.push({
//                 user_id: req.body.user_id,
//                 indicator_name: 'customSma',
//                 parameter_name: 'length',
//                 parameter_value: customSma.length.toString(),
//             });
//         }

//         // Bulk create settings
//         const createdSettings = await IndicatorSetting.bulkCreate(settings);
//         res.status(201).json(createdSettings);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Failed to create indicator settings' });
//     }
// });




router.post('/indicator-settings', async (req, res) => {
    console.log("indicator-settings input:", req.body);

    const {  conditions } = req.body;  // Extract user_id and conditions from the body
const user_id = 2;
    try {
        // Initialize an empty array to hold the settings data to be saved
        const settings = [];

        // Iterate through the conditions array and create settings for each condition
        if (conditions && Array.isArray(conditions)) {
            conditions.forEach((condition) => {
                const { Indicator, Length, Source, Color } = condition;

                // Add each condition as a new setting entry
                settings.push({
                    user_id: user_id,  // Add user_id for each setting
                    indicator_name: Indicator,  // Set the indicator name
                    parameter_name: 'length',
                    parameter_value: Length.toString(),  // Store length as a string
                });

                settings.push({
                    user_id: user_id,
                    indicator_name: Indicator,
                    parameter_name: 'source',
                    parameter_value: Source,  // Store source
                });

                settings.push({
                    user_id: user_id,
                    indicator_name: Indicator,
                    parameter_name: 'color',
                    parameter_value: Color,  // Store the color
                });
            });
        }

        // Bulk create settings in the database (assuming IndicatorSetting is a Sequelize model)
        const createdSettings = await IndicatorSetting.bulkCreate(settings);

        // Return the created settings in the response
        res.status(201).json(createdSettings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create indicator settings' });
    }
});


// API to get all indicator settings for a user
// router.get('/indicator-settings/:userId', async (req, res) => {
//     const { userId } = req.params;

//     try {
//         const settings = await IndicatorSetting.findAll({
//             where: { user_id: userId }
//         });
//         res.status(200).json(settings);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Failed to retrieve indicator settings' });
//     }
// });


// API to get indicator settings based on user_id
router.get('/indicator-settings/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        // Fetch all the indicator settings for the given user_id
        const indicatorSettings = await IndicatorSetting.findAll({
            where: {
                user_id: user_id,  // Filter by user_id
            },
            order: [
                ['indicator_name', 'ASC'],  // Order by indicator name
                ['parameter_name', 'ASC'],  // Order by parameter name (length, source, color)
            ],
        });

        // Group the settings by indicator name
        const conditions = [];

        indicatorSettings.forEach((setting) => {
            const indicator = conditions.find((condition) => condition.Indicator === setting.indicator_name);
            
            if (indicator) {
                // Add parameter to the existing indicator
                indicator[setting.parameter_name] = setting.parameter_value;
            } else {
                // Create new indicator object
                const newIndicator = {
                    Indicator: setting.indicator_name,
                    [setting.parameter_name]: setting.parameter_value,
                };
                conditions.push(newIndicator);
            }
        });

        // Send the response with the formatted conditions
        res.status(200).json({
            conditions: conditions,
        });

    } catch (error) {
        console.error("Error fetching indicator settings:", error);
        res.status(500).json({
            message: 'Failed to fetch indicator settings',
            error: error.message,
        });
    }
});


module.exports = router;
