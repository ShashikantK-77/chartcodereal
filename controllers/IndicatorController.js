// controllers/indicatorController.js

const db = require('../config/database'); // Adjust path to your database module
const {jwtDecode} = require('jwt-decode');


// Get indicator parameters
const getIndicatorParameters = async (req, res) => {
    try {
      const query = `
        SELECT * FROM indicator_parameters
      `;
      const result = await db.query(query);
  
      // Access the first element of the result array to get the actual data
      const indicatorData = result[0];
  
      if (!indicatorData || !Array.isArray(indicatorData)) {
        throw new Error('Unexpected query result format');
      }
  
      // Transform the data into the required format
      const formattedData = indicatorData.reduce((acc, item) => {
        if (!acc[item.indicator_name]) {
          acc[item.indicator_name] = [];
        }
  
        // Ensure subproperties is an array if it's not already
        const subproperties = item.subproperties ? item.subproperties : [];
  
        acc[item.indicator_name].push({
          name: item.parameter_name,
          Datatype: item.data_type,
          subproperties: Array.isArray(subproperties) ? subproperties : subproperties.split(','),
        });
        return acc;
      }, {});
  
      res.json(formattedData);
    } catch (error) {
      console.error('Error fetching indicator parameters:', error.message);
      res.status(500).json({ error: 'Failed to fetch indicator parameters' });
    }
  };
  


  const getUserIdFromContext = (req) => {
    const token = req.headers['authorization']?.split(' ')[1];
    const decoded = jwtDecode(token);
    // console.log("decoded:",decoded);
    return decoded.user.user_id; // Adjust based on your JWT payload structure
  };
  
  const getUserFromContext = (req) => {
    const token = req.headers['authorization']?.split(' ')[1];
    const decoded = jwtDecode(token);
    return decoded.user.name; // Adjust based on your JWT payload structure
  };
  

module.exports = {
  getIndicatorParameters,getUserIdFromContext,getUserFromContext
};
