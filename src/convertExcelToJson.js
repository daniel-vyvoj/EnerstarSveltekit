const xlsToJson = require('xls-to-json');
const path = require('path');

const inputFilePath = path.resolve(__dirname, 'src', 'DataCen.xls');
const outputFilePath = path.resolve(__dirname, 'src', 'DataCen.json');

// @ts-ignore
xlsToJson(
  {
    input: inputFilePath,
    output: outputFilePath,
    sheet: 'Sheet1', // Název listu v Excel souboru
    lowerCaseHeaders: true, // Převést názvy sloupců na malá písmena
  },
  // @ts-ignore
  (err, result) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Konverze dokončena.');
    }
  }
);
