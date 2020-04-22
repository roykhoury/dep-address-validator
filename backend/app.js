const express = require('express');
const scraper = require('./scraper/scrapDepsInfo');
const xlsxConverter = require('./scripts/convertXlsxToJson');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const OUTPUT_PATH = './testdata/results/';

let progress = {current: {}};

app.get('/status', (req, res) => {
  if (!req.query.output) {
    res.json({error_code: 1, err_desc: "No fileId passed"});
    return;
  }

  return res.json(progress.current[req.query.output]);
});

app.post('/runValidation', function (req, res) {
  upload(req, res, (err) => {
    if (err) {
      res.json({error_code: 1, err_desc: err});
      return;
    }

    if (!req.file) {
      res.json({error_code: 1, err_desc: "No file passed"});
      return;
    }
    req.file.output = removeExtension(req.file.filename);

    // in this case, setTimeout is used to separate the function and execute it in a separate thread
    xlsxConverter.convert(req.file.path);
    setTimeout(validateJson, 0, res, req);

    res.json(req.file);
  });
});

app.get('/download', function (req, res) {
  if (!req.query.output) {
    res.json({error_code: 1, err_desc: 'Must pass file name to download'})
    return;
  }

  let path = OUTPUT_PATH + req.query.output;
  if (!fs.existsSync(path)) {
    res.json({error_code: 3, err_desc: 'File does not exist, it is probably still being processed/validated'});
    return;
  }

  res.setHeader('Content-disposition', 'attachment; filename=results.csv');
  res.download(path);
});

app.listen(PORT, function () {
  console.log('App started successfully: port', PORT);
});

let validateJson = function (res, req) {
  scraper.runValidation(req.file.path + ".json", progress, req.body.headersCount, req.file.output);
};

let storage = multer.diskStorage({ //multers disk storage settings
  destination: function (req, file, cb) {
    cb(null, './testdata/uploads/')
  },
  filename: function (req, file, cb) {
    let timestamp = Date.now();
    cb(null, file.fieldname + '-' + timestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
  }
});

let upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) { //file filter
    if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
      return callback(new Error('Wrong extension type'));
    }
    callback(null, true);
  }
}).single('file');

let removeExtension = (filename) => {
  let parts = filename.split('.');
  parts.pop();
  return parts.join() + '.csv';
};
