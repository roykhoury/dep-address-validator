const fs = require('fs');
const XLSX = require('xlsx');

module.exports = {
  convert: (async (path) => {
    try {
      const workBook = XLSX.readFile(path);
      const sheet = workBook.Sheets.Accounts;
      const jsonData = XLSX.utils.sheet_to_json(sheet, {header: 1, blankRows: false});
      fs.writeFileSync(
        path + ".json",
        JSON.stringify(jsonData, replacer, 4),
        'utf-8'
      );
      console.log('Successfully converted ' + jsonData.length +' rows to: ', path);
    } catch (e) {
      throw Error(e);
    }
  }),
};

function replacer(key, value) {
  if (Array.isArray(value) && value.length === 0) {
    return undefined;
  }
  return value;
}
