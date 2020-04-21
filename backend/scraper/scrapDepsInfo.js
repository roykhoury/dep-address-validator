const ObjectsToCsv = require('objects-to-csv')
const puppeteer = require('puppeteer');
const parseAddress = require('parse-address-string');
const parser = require('parse-address');

const GOOGLE_URL = 'https://google.ca';
const GOOGLE_SEARCH_BAR_SELECTOR = 'input[class="gLFyf gsfi"]';
const GOOGLE_SIDE_INFO_PANEL = 'span[class="LrzXr"]';
const OUTPUT_PATH = '../testdata/results/testResults.csv';

let resultArray = [[
  'Name',
  'Name correction',
  'Address',
  'Address correction',
  'City',
  'City correction',
  'State',
  'State correction',
  'Zip',
  'Zip correction',
  'Notes'
]];

module.exports = {
  withHeaders: false,
  runValidation: (async (progress) => {
    const testData = require('..\\..\\testdata\\testData.json');

    // configs
    const browser = await puppeteer.launch({
      defaultViewport: null,
      headless: true,
      devtools: false,
      // slowMo: 20 // slow down by 20ms
    });

    const startingIndex = this.withHeaders ? 1 : 0;
    for (let i = startingIndex; i < testData.length; i++) {
      await processSearch(testData[i], i, browser);
      progress.current = updateProgress(i, testData.length);
    }

    await browser.close();
    await exportToCsv();
  }),
};

let processSearch = async (dataArray, index, browser) => {
  let depName = dataArray[5];
  let depAddress = convertToEnglish(dataArray[7]);
  let depCity = convertToEnglish(dataArray[9]);
  let depState = convertToEnglish(dataArray[11]);
  let depZip = dataArray[13];

  // go to google website
  const page = await browser.newPage();
  await page.goto(GOOGLE_URL, {waitUntil: 'networkidle2'});

  // Type dep address, and press Enter
  await Promise.all([
    await page.type(GOOGLE_SEARCH_BAR_SELECTOR, depName + " " + depAddress),
    await page.keyboard.press('Enter'),
  ]);

  await page.waitForNavigation();

  // get side panel address information
  const sidePanel = await page.$(GOOGLE_SIDE_INFO_PANEL);

  // if side panel not found, skip this one, and signal for manual verification
  if (sidePanel == null) {
    let errMsg = 'Could not find information for: ' + depName;
    console.log(errMsg);
    //
    // await page.click('h3[class="LC20lb DKV0Md"]');
    // const ypAddress = await page.click('div[class="page__container"]');
    //
    // console.log(ypAddress);
    // console.log(text);

    dataArray[999] = errMsg;
    resultArray.push(finalizeArray(dataArray));
    await page.close();
    return;
  }

  const googleFullAddress = await page.evaluate(element => element.textContent, sidePanel);

  let googleInfo = {};
  parseAddress(googleFullAddress, (err, addressObj) => {

    googleInfo.street = convertToEnglish(addressObj.street_address1);
    googleInfo.city = convertToEnglish(addressObj.city);
    googleInfo.state = convertToEnglish(addressObj.state);
    googleInfo.zip = addressObj.postal_code;

    // depAddress index is 2, so correction index is 3
    dataArray[8] = !isAddressEqual(googleInfo.street, depAddress) ? googleInfo.street : null;

    // depCity index is 4, so correction index is 5
    dataArray[10] = googleInfo.city != depCity ? googleInfo.city : null;

    // depState index is 6, so correction index is 7
    dataArray[12] = !isStateEqual(googleInfo.state, depState) ? googleInfo.state : null;

    // depZip index is 8, so correction index is 9
    dataArray[14] = !isZipEqual(googleInfo.zip, depZip) ? googleInfo.zip : null;

    resultArray.push(finalizeArray(dataArray));
    console.table(resultArray);
  });

  await page.close();
};

let convertToEnglish = (address) => {
  let search = [
    'ë', 'à', 'ì', 'â', 'í', 'ã', 'î', 'ä', 'ï', 'ç', 'ò', 'è', 'ó', 'é', 'ô', 'ê', 'õ', 'ö', 'ê', 'ù', 'ë', 'ú', 'î', 'û', 'ï', 'ü', 'ô', 'ý', 'õ', 'â', 'û', 'ã', 'ÿ', 'ç', '-',
    'Ë', 'À', 'Ì', 'Â', 'Í', 'Ã', 'Î', 'Ä', 'Ï', 'Ç', 'Ò', 'È', 'Ó', 'É', 'Ô', 'Ê', 'Õ', 'Ö', 'Ê', 'Ù', 'Ë', 'Ú', 'Î', 'Û', 'Ï', 'Ü', 'Ô', 'Ý', 'Õ', 'Â', 'Û', 'Ã', 'Ÿ', 'Ç'
  ];
  let replace = [
    'e', 'a', 'i', 'a', 'i', 'a', 'i', 'a', 'i', 'c', 'o', 'e', 'o', 'e', 'o', 'e', 'o', 'o', 'e', 'u', 'e', 'u', 'i', 'u', 'i', 'u', 'o', 'y', 'o', 'a', 'u', 'a', 'y', 'c', ' ',
    'E', 'A', 'I', 'A', 'I', 'A', 'I', 'A', 'I', 'C', 'O', 'E', 'O', 'E', 'O', 'E', 'O', 'O', 'E', 'U', 'E', 'U', 'I', 'U', 'I', 'U', 'O', 'Y', 'O', 'A', 'U', 'A', 'Y', 'C'
  ];

  search.forEach((val, i) => {
    if (address != null) {
      address = address.replace(val, replace[i]);
    }
  });

  return address;
};

let filterWords = (words) => {
  let unwantedWords = [
    'av', 'Av', 'av.', 'Av.', 'ave', 'Ave', 'ave.', 'Ave.', 'boul', 'Boul', 'boul.', 'Boul.',
    'Boulevard', 'boulevard', 'Blvd', 'blvd', 'Blvd.', 'blvd.', 'Avenue', 'avenue', 'Saint',
    'saint', 'Sainte', 'sainte', 'Rue', 'rue', 'st.', 'St.', 'st', 'St', '.', '\''];
  let filteredWords = [];

  words.forEach((word) => {
    if (unwantedWords.indexOf(word) < 0) {
      filteredWords.push(word.toLowerCase());
    }
  });

  return filteredWords;
};

let isAddressEqual = (googleAddress, sheetAddress) => {
  let parsedAddress1 = parser.parseLocation(googleAddress);
  let parsedAddress2 = parser.parseLocation(sheetAddress);

  if (parsedAddress1.number != parsedAddress2.number) {
    return false;
  }

  let googleWords = googleAddress.split(' ');
  let sheetWords = sheetAddress.split(' ');

  googleWords = filterWords(googleWords);
  sheetWords = filterWords(sheetWords);

  return googleWords.every(val => sheetWords.includes(val));
};

let isStateEqual = (googleState, sheetState) => {
  let qcStates = ['QC', 'Qc', 'qc', 'quebec', 'QUEBEC', 'Quebec'];
  return qcStates.indexOf(sheetState) >= 0 && qcStates.indexOf(googleState) >= 0;
};

let isZipEqual = (googleZip, sheetZip) => {
  return googleZip == sheetZip;
};

let exportToCsv = async () => {
  const csv = new ObjectsToCsv(resultArray);
  await csv.toDisk(OUTPUT_PATH);

  console.log('Successfully exported to csv. ', OUTPUT_PATH);
};

let finalizeArray = (dataArray) => {
  let resultArray = [];
  for (let i = 5; i <= 14; i++) {
    resultArray.push(i === 6 ? null : dataArray[i]);
  }
  resultArray.push(dataArray[999]);
  return resultArray;
};

let updateProgress = (current, total) => {
  this.progress = ( current / total ) * 100;
  return this.progress;
};
