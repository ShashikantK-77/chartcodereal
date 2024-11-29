const { parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const fastCsv = require('fast-csv');

const symbols = [];

fs.createReadStream(workerData.filePath)
  .pipe(fastCsv.parse({ headers: true }))
  .on('data', (row) => {
    if (row.SEM_EXM_EXCH_ID && row.SM_SYMBOL_NAME && row.SEM_INSTRUMENT_NAME) {
      symbols.push({
        exchange: row.SEM_EXM_EXCH_ID,
        symbol: row.SM_SYMBOL_NAME,
        full_name: row.SEM_INSTRUMENT_NAME,
        type: row.SEM_SEGMENT === 'E' ? 'equity' : 'other',
        strike_price: row.SEM_STRIKE_PRICE || null,
        expiry_date: row.SEM_EXPIRY_DATE || null,
        lot_size: row.SEM_LOT_UNITS || 1,
        segment: row.SEM_SEGMENT,
        instrument_type: row.SEM_EXCH_INSTRUMENT_TYPE,
        SECURITY_ID: row.SEM_SMST_SECURITY_ID,
      });
    }
  })
  .on('end', () => {
    parentPort.postMessage(symbols); // Send the processed symbols back to the main thread
  })
  .on('error', (err) => {
    parentPort.postMessage({ error: err.message });
  });
