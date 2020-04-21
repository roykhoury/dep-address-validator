const fs = require('fs');
const XLSX = require('xlsx');

const outputPath = '../testdata/testData.json';

module.exports = {
  convert: (async (inputPath) => {
    try {
      const workBook = XLSX.readFile(inputPath);
      const sheet = workBook.Sheets.Accounts;
      const jsonData = XLSX.utils.sheet_to_json(sheet, {header: 1});
      await fs.writeFileSync(
        outputPath,
        JSON.stringify(jsonData, null, 4),
        'utf-8'
      );
      console.log('Successfully convert xlsx file to JSON!');
    } catch (e) {
      throw Error(e);
    }

  }),
};
