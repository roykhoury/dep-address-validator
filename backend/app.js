const scraper = require('./scraper/scrapDepsInfo');
const xlsxConverter = require('./scripts/convertXlsxToJson');
const fileUpload = require('express-fileupload');

const PORT = 3000;
const OUTPUT_PATH = '../testdata/results/testResults.csv';
const INPUT_PATH = '../testdata/';

let express = require('express');
let progress = {current: 0};
let app = express();

app.use(fileUpload());

app.get('/status', (req, res) => {
  return res.json(progress);
});

app.post('/runValidation', async (req, res) => {
  await saveFile(req.files.file);
  await xlsxConverter.convert(INPUT_PATH + 'test-data.xlsx');
  await validateJson(res, req);
});

app.listen(PORT, function () {
  console.log('App started successfully: port', PORT);
});

let validateJson = async (res, req) => {
  scraper.withHeaders = true;
  await scraper.runValidation(progress);

  res.setHeader('Content-disposition', 'attachment; filename=results.csv');
  await res.download(OUTPUT_PATH);
};

let saveFile = async (file) => {
  file.mv(INPUT_PATH + 'test-data-' + new Date().getMilliseconds() + '.xlsx', (err) => {
    if (err) {
      console.log('Error saving file:')
    }
  });
};
