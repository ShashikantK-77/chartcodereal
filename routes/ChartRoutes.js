

const express = require('express');
const router = express.Router();
const IndicatorSetting = require('../dal/models/IndicatorSettingModel'); // Adjust the path as needed
const { Worker } = require('worker_threads');
const fastCsv = require('fast-csv');



const path = require('path'); // Import the path moduley
const fs = require('fs');
const csv = require('csv-parser');
const fetch = require('node-fetch'); // Ensure `node-fetch` is installed or use the appropriate method for HTTP requests

const now = new Date();

// Calculate start of the day (midnight)
const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const TimeFrom = Math.floor(startOfDay.getTime() / 1000); // Convert to Unix timestamp

// Calculate end of the day (23:59:59)
const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
const TimeTo = Math.floor(endOfDay.getTime() / 1000); // Convert to Unix timestamp

const dummyResponse = {
    open: Array(100).fill(-1.7976931348623157e+308),
    high: Array(100).fill(-1.7976931348623157e+308),
    low: Array(100).fill(-1.7976931348623157e+308),
    close: Array(100).fill(-1.7976931348623157e+308),
    volume: Array(100).fill(-1.7976931348623157e+308),
    start_Time: Array(100).fill(-1.7976931348623157e+308),
};


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




router.get('/api/getProcessedData', (req, res) => {
    const transformedData = {
        Response: 'Success',
        Type: 100,
        Aggregated: false,
        TimeFrom: TimeFrom,
        TimeTo: TimeTo,
        ConversionType: {
            type: 'force_direct',
            conversionSymbol: ''
        },
        Data: [],
        FirstValueInArray: true,
        HasWarning: false,
        RateLimit: {},
    };

    const newData = [
        { time: 1725080400, close: 59408, high: 59533, low: 59408, open: 59533, volume: 100 },
        { time: 1725084000, close: 59347, high: 59448, low: 59347, open: 59408, volume: 150 },
        { time: 1725087600, close: 59273, high: 59368, low: 59252, open: 59347, volume: 200 },
        { time: 1725091200, close: 59156, high: 59297, low: 59155, open: 59273, volume: 250 }
    ];

    transformedData.Data = newData.map(item => ({
        time: item.time,
        close: item.close,
        high: item.high,
        low: item.low,
        open: item.open,
        volume: item.volume,
        start_Time: item.time,
    }));

    res.json(transformedData);
});


router.post('/proxy', async (req, res) => {
    console.log("in proxy");
    
    const { securityId, exchangeSegment, instrument } = req.body;

    if (!securityId || !exchangeSegment || !instrument) {
        return res.status(400).json({ message: 'Missing required parameters: securityId, exchangeSegment, or instrument' });
    }

    const bodyData = {
        securityId,
        exchangeSegment,
        instrument,
    };

    console.log("in proxy bodyData:",bodyData);
    

    const url = 'https://api.dhan.co/charts/intraday';
    const headers = {
        'access-token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJkaGFuIiwicGFydG5lcklkIjoiIiwiZXhwIjoxNzM0ODQ3ODEwLCJ0b2tlbkNvbnN1bWVyVHlwZSI6IlNFTEYiLCJ3ZWJob29rVXJsIjoiIiwiZGhhbkNsaWVudElkIjoiMTEwMTM0Mzg3MSJ9.4Vls2cZFfb9gtxIGHnRKrqzctT48s47IRpxknjy3o8baEnOShCVYWDvWQ5PUHj98AWdq62iI4vJK7mPNrZ3RZw',  // Replace with your actual access token
        'Content-Type': 'application/json',
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(bodyData),
        });

        if (!response.ok) {
            return res.status(response.status).json({ message: `Request failed with status: ${response.status}` });
        }

        const rawData = await response.json();
        const processedData = rawData.open.slice(1).map((_, index) => ({
            time: rawData.start_Time[index + 1],
            close: rawData.close[index + 1],
            high: rawData.high[index + 1],
            low: rawData.low[index + 1],
            open: rawData.open[index + 1],
            volume: rawData.volume[index + 1],
            start_Time: rawData.start_Time[index + 1],
        }));

        const transformedData = {
            Response: 'Success',
            Type: 100,
            Aggregated: false,
            TimeFrom: 1732605600,
            TimeTo: 1732648800,
            ConversionType: {
                type: 'force_direct',
                conversionSymbol: ''
            },
            Data: processedData,
            FirstValueInArray: true,
            HasWarning: false,
            RateLimit: {},
        };

        res.json(transformedData);
    } catch (error) {
        console.error('Error forwarding request:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



// Download log file endpoint

// router.post('/proxy', async (req, res) => {
//     console.log("In proxy");

//     // Extract required parameters from request body
//     const { securityId, exchangeSegment, instrument } = req.body;

//     if (!securityId || !exchangeSegment || !instrument) {
//         return res.status(400).json({ message: 'Missing required parameters: securityId, exchangeSegment, or instrument' });
//     }

//     const bodyData = {
//         securityId,
//         exchangeSegment,
//         instrument,
//     };

//     console.log("Proxy request body data:", bodyData);

//     // API URL and headers (use environment variables for sensitive data like the token)
//     const url = 'https://api.dhan.co/charts/intraday';
//     const headers = {
//         'access-token': process.env.ACCESS_TOKEN, // Use environment variable for token
//         'Content-Type': 'application/json',
//     };

//     try {
//         // Make the API request
//         const response = await fetch(url, {
//             method: 'POST',
//             headers,
//             body: JSON.stringify(bodyData),
//         });

//         // Handle rate-limiting (429 Too Many Requests)
//         // if (response.status === 429) {
//         //     console.error('Rate limit exceeded. Retrying...');
//         //     const retryAfter = response.headers.get('Retry-After') || 10; // Default to 10 seconds
//         //     return setTimeout(() => {
//         //         // Retry logic can be added here (e.g., make the request again after the delay)
//         //         res.status(429).json({ message: `Rate limit exceeded. Try again after ${retryAfter} seconds.` });
//         //     }, retryAfter * 5000);
//         // }

//         // // If the response is not OK, return the status code and message
//         // if (!response.ok) {
//         //     return res.status(response.status).json({ message: `Request failed with status: ${response.status}` });
//         // }

//         // Parse the raw response data
//         const rawData = await response.json();
//         // const rawData = await dummyResponse.json();
//         console.log("Raw data from API:", rawData);

//         // Process and transform the data into the required format
//         const processedData = transformData(rawData);

//         // Send the transformed data in the response
//         const transformedData = {
//             Response: 'Success',
//             Type: 100,
//             Aggregated: false,
//             TimeFrom: 1732605600,
//             TimeTo: 1732648800,
//             ConversionType: {
//                 type: 'force_direct',
//                 conversionSymbol: ''
//             },
//             Data: processedData,
//             FirstValueInArray: true,
//             HasWarning: false,
//             RateLimit: {},
//         };

//         res.json(transformedData);
//     } catch (error) {
//         console.error('Error forwarding request:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });


// router.post('/proxy', async (req, res) => {
//     console.log("In proxy");

//     // Extract required parameters from request body
//     const { securityId, exchangeSegment, instrument } = req.body;

//     if (!securityId || !exchangeSegment || !instrument) {
//         return res.status(400).json({ message: 'Missing required parameters: securityId, exchangeSegment, or instrument' });
//     }

//     const bodyData = {
//         securityId,
//         exchangeSegment,
//         instrument,
//     };

//     console.log("Proxy request body data:", bodyData);

//     const getRandomNumberInRange = (min, max) => {
//         return (Math.random() * (max - min)) + min;
//     }

//     // Generate random data for the dummy response, each item in the array will represent a bar
// // Generate random data for the dummy response, each item in the array will represent a bar
// const generateRandomData = (size = 100) => {
//     const bars = [];
//     let lastTime = Math.floor(Date.now() / 1000); // Set the last time as the current time in seconds
    
//     // Ensure lastTime is a valid number
//     if (isNaN(lastTime)) {
//         console.error('Invalid timestamp value');
//         lastTime = Math.floor(Date.now() / 1000); // Recalculate in case of invalid timestamp
//     }

//     for (let i = 0; i < size; i++) {
//         lastTime += Math.floor(Math.random() * 100); // Add random seconds to generate unique timestamps

//         // Ensure the timestamp is valid
//         if (isNaN(lastTime)) {
//             console.error('Invalid timestamp during iteration', i);
//             lastTime = Math.floor(Date.now() / 1000); // Recalculate in case of invalid timestamp
//         }

//         bars.push({
//             open: getRandomNumberInRange(100, 200), // Random open prices between 100 and 200
//             high: getRandomNumberInRange(200, 250), // Random high prices between 200 and 250
//             low: getRandomNumberInRange(50, 100),   // Random low prices between 50 and 100
//             close: getRandomNumberInRange(100, 200), // Random close prices between 100 and 200
//             volume: getRandomNumberInRange(1000, 10000), // Random volume between 1000 and 10000
//             start_Time: lastTime // Use the lastTime as the timestamp for the bar
//         });
//     }

//     return {
//         open: bars.map(bar => bar.open),
//         high: bars.map(bar => bar.high),
//         low: bars.map(bar => bar.low),
//         close: bars.map(bar => bar.close),
//         volume: bars.map(bar => bar.volume),
//         start_Time: bars.map(bar => bar.start_Time)
//     };
// };



//     // Dummy response with random data
//     const dummyResponse = generateRandomData();

//     // Simple transformData function
//     function transformData(rawData) {
//         // You can modify this if needed, for now, we return the raw data as is
//         return rawData;
//     }

//     try {
//         console.log("Using dummy response as fallback...");

//         // Process and transform the dummy data
//         const processedData = transformData(dummyResponse);

//         // Prepare the response object
//         const transformedData = {
//             Response: 'Success',
//             Type: 100,
//             Aggregated: false,
//             TimeFrom: 1732605600,
//             TimeTo: 1732648800,
//             ConversionType: {
//                 type: 'force_direct',
//                 conversionSymbol: ''
//             },
//             Data: processedData,
//             FirstValueInArray: true,
//             HasWarning: false,
//             RateLimit: {},
//         };

//         // Send the transformed data as the response
//         res.json(transformedData);
//     } catch (error) {
//         console.error('Error processing dummy response:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });


router.get('/download-log', (req, res) => {
    const logFilePath = path.join(__dirname, 'error-log.log');  // Ensure this path is correct

    // Log the path for debugging
    console.log('Looking for log file at:', logFilePath);

    // Check if the log file exists
    fs.access(logFilePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error('Log file not found:', err);
            return res.status(404).json({ message: 'Log file not found.' });
        }

        // If the file exists, initiate the download
        res.download(logFilePath, 'error-log.log', (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                res.status(500).json({ message: 'Failed to download the log file.' });
            }
        });
    });
});


// Log error API endpoint
router.post('/log-error', (req, res) => {
    const { fileName, error } = req.body;
  
    if (!fileName || !error) {
        return res.status(400).json({ message: 'File name and error message are required.' });
    }

    // Get the current date-time
    const dateTime = new Date().toISOString();
    
    // Format the log message
    const logMessage = `${dateTime} - ${fileName} - ${error}\n`;

    // Define the log file path
    const logFilePath = path.join(__dirname, 'error-log.log');
  
    // Append the error log to the file
    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to write to log file.' });
        }
        res.status(200).json({ message: 'Error logged successfully.' });
    });
});


// Download log file endpoint
router.get('/download-log', (req, res) => {
    const logFilePath = path.join(__dirname, 'error-log.log');  // Ensure this path is correct

    // Log the path for debugging
    console.log('Looking for log file at:', logFilePath);

    // Check if the log file exists
    fs.access(logFilePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error('Log file not found:', err);
            return res.status(404).json({ message: 'Log file not found.' });
        }

        // If the file exists, initiate the download
        res.download(logFilePath, 'error-log.log', (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                res.status(500).json({ message: 'Failed to download the log file.' });
            }
        });
    });
});
  // API endpoint
router.post('/sym', async (req, res) => {

    const { exchange = 'BSE', segment = 'EQUITY' } = req.body || {}; // Default values if body is null or empty
  
    try {
    const filePath = path.join(__dirname, 'api-scrip-master.csv'); // Get the absolute path to the CSV file
        // const filePath = path.join(__dirname, filePath);
      const allSymbols = await getUniqueExchangesAndSymbols(filePath);
  
      // Filter symbols based on provided exchange and segment
      const filteredSymbols = allSymbols.Data.filter(symbol =>
        symbol.exchange === exchange && symbol.full_name.includes(segment) // Partial match for segment
      );
  
      res.json({
        success: true,
        Data: filteredSymbols,
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to read or parse CSV fileeeee',
        details: error.message,
      });
    }
  });


async function getUniqueExchangesAndSymbols(filePath) {
    return new Promise((resolve, reject) => {
      const symbols = [];
  
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          if (row.SEM_EXM_EXCH_ID && row.SM_SYMBOL_NAME && row.SEM_INSTRUMENT_NAME) {
            const symbolObject = {
              exchange: row.SEM_EXM_EXCH_ID.trim(),
              symbol: row.SM_SYMBOL_NAME.trim(),
              full_name: row.SEM_INSTRUMENT_NAME.trim(),
              type: row.SEM_SEGMENT === 'E' ? 'equity' : 'other',
              strike_price: row.SEM_STRIKE_PRICE || null,
              expiry_date: row.SEM_EXPIRY_DATE || null,
              lot_size: row.SEM_LOT_UNITS || 1,
              segment: row.SEM_SEGMENT,
              instrument_type: row.SEM_EXCH_INSTRUMENT_TYPE,
              SECURITY_ID: row.SEM_SMST_SECURITY_ID,
            };
            symbols.push(symbolObject);
          }
        })
        .on('end', () => {
          resolve({
            success: true,
            Data: symbols,
          });
        })
        .on('error', (error) => reject(error));
    });
  }

// function parseCsvInWorker(filePath) {
//     return new Promise((resolve, reject) => {
//       const worker = new Worker('./csvWorker.js', {
//         workerData: { filePath },
//       });
  
//       worker.on('message', (data) => {
//         resolve(data); // Receive the processed symbols
//       });
  
//       worker.on('error', (err) => {
//         reject(err);
//       });
  
//       worker.on('exit', (code) => {
//         if (code !== 0) {
//           reject(new Error(`Worker stopped with exit code ${code}`));
//         }
//       });
//     });
//   }
  
//   // Main function
//   async function getUniqueExchangesAndSymbols(filePath) {
//     try {
//       const result = await parseCsvInWorker(filePath);
//       return { success: true, Data: result };
//     } catch (error) {
//       return { success: false, error: error.message };
//     }
//   }
  

function processCSV(filePath) {
    return new Promise((resolve, reject) => {
        const result = {};

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                const exchange = row.SEM_TRADING_SYMBOL.split('-')[0];
                const symbol = row.SEM_TRADING_SYMBOL.split('-')[1];

                if (!result[exchange]) {
                    result[exchange] = [];
                }
                result[exchange].push(symbol);
            })
            .on('end', () => resolve(result))
            .on('error', (error) => reject(error));
    });
}


module.exports = router;
