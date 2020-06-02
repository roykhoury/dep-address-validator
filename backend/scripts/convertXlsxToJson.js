const fs = require('fs');
const XLSX = require('xlsx');

module.exports = {
  convert: (async (path) => {
    try {
      const workBook = XLSX.readFile(path);
      const sheet = workBook.Sheets.Accounts;

      let jsonData = XLSX.utils.sheet_to_json(sheet, {header: 1, blankRows: false});
      jsonData = filterJsonData(jsonData);

      fs.writeFileSync(
        path + ".json",
        JSON.stringify(jsonData, null, 4),
        'utf-8'
      );
      console.log('Successfully converted ' + jsonData.length +' rows to: ', path);
    } catch (e) {
      throw Error(e);
    }
  }),
};

function filterJsonData(jsonData) {
  let newJsonData = [];
  jsonData.forEach(e => {
    if (e != null && e.length > 0) {
      newJsonData.push(e);
    }
  });
  return newJsonData;
}
