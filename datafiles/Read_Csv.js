const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const Read_Csv = (filepath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(path.join(__dirname, filepath)) // Adjust the file path
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

module.exports = { Read_Csv };
