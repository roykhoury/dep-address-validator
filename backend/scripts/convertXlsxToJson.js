const fs = require('fs');
const XLSX = require('xlsx');

module.exports = {
  convert: (async (path) => {
    try {
      const workBook = XLSX.readFile(path);
      const sheet = workBook.Sheets.Accounts;
      const jsonData = XLSX.utils.sheet_to_json(sheet, {header: 1});
      fs.writeFileSync(
        path + ".json",
        JSON.stringify(jsonData, null, 4),
        'utf-8'
      );
      console.log('Successfully converted: ', path);
    } catch (e) {
      throw Error(e);
    }
  }),
};
