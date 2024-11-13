
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const UniqueSymbolsData = require('../dal/models/UniqueSymbolsModel');



const exchangeMap = {
    'NSE_INDEX': 0,
    'NSE_EQUITY': 1,
    'NSE_OPTFUT': 2,
    'NSE_OPTCUR': 3,
    'BSE_EQUITY': 4,
    'MCX_OPTFUT': 5,
    'BSE_OPTCUR': 7,
    'BSE_OPTFUT': 8,
    'BSE_FUTCUR': 4
};

// Utility function to read the CSV file and find security IDs
const searchSecurityIds = async (symbols) => {
    const filePath = path.join(__dirname, '../datafiles/dhan_securities.csv');
    const securityIds = [];

    for (const item of symbols) {
        const { symbol, exchanges, categories } = item;

        for (const exchange of exchanges) {
            for (const category of categories) {
                const exchangeCategoryKey = `${exchange}_${category}`;
                const exchangeId = exchangeMap[exchangeCategoryKey];

                if (exchangeId !== undefined) {
                    // Read the CSV file and find the matching security ID
                    const rows = await new Promise((resolve, reject) => {
                        const results = [];
                        fs.createReadStream(filePath)
                            .pipe(csv())
                            .on('data', (data) => results.push(data))
                            .on('end', () => resolve(results))
                            .on('error', (err) => reject(err));
                    });

                    const matchedRow = rows.find(row => row.SEM_TRADING_SYMBOL === symbol && row.SEM_EXM_EXCH_ID === exchange);
                    if (matchedRow) {
                        const securityId = matchedRow.SEM_SMST_SECURITY_ID;
                        securityIds.push({ symbol, exchangeId, securityId });
                    }
                }
            }
        }
    }

    return securityIds;
};

module.exports = { searchSecurityIds };