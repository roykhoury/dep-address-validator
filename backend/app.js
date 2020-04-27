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
    res.status(500).json({error_code: 1, err_desc: "No fileId passed"});
    return;
  }

  return res.status(200).json(progress.current[req.query.output]);
});

app.post('/runValidation', function (req, res) {
  upload(req, res, (err) => {
    if (err) {
      res.status(500).json({error_code: 1, err_desc: 'Unknown error'});
      return;
    }

    if (!req.file) {
      res.status(500).json({error_code: 1, err_desc: 'No file passed'});
      return;
    }
    req.file.output = removeExtension(req.file.filename);

    // in this case, setTimeout is used to separate the function and execute it in a separate thread
    xlsxConverter.convert(req.file.path);
    setTimeout(validateJson, 0, res, req);

    res.status(200).json(req.file);
  });
});

app.get('/download', function (req, res) {
  if (!req.query.output) {
    res.status(500).json({error_code: 1, err_desc: 'Must pass file name to download'})
    return;
  }

  let path = OUTPUT_PATH + req.query.output;
  if (!fs.existsSync(path)) {
    res.status(500).json({error_code: 3, err_desc: 'File does not exist, it is probably still being processed/validated'});
    return;
  }

  res.setHeader('Content-disposition', 'attachment; filename=results.csv');
  res.status(200).download(path);
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
  storage: storage
}).single('file');

let removeExtension = (filename) => {
  let parts = filename.split('.');
  parts.pop();
  return parts.join() + '.csv';
};
