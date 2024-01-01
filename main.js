'use strict';

import './style.css';
import { createFormulaBar, setCoordsArr, getCoordsArr } from "./components/formulaBar";
import { createSheet, newArray, navDown, navUp, navRight, navLeft } from './components/sheet';
import { sheetSize } from './config.json';
import { createStorage, getFormula, saveFormula, refreshSheet } from './controllers/storageManager';
import { parseFormula } from './functions/calculator';
import { toAddress } from './functions/addressConverter';

/**
  * Creates the formula bar and grid on the page, with one additional row and column for the
  * address heading
  */
document.querySelector('#app').innerHTML = `
  <div>
    ${createFormulaBar(sheetSize)}
    ${createSheet(sheetSize)}
  </div>
`;

/**
  * Creates an array (3 dimesions: `size` x `size` x 2) to store formulas and values
  */
export const storageArr = createStorage(sheetSize);

/**
  * Update the formula and value in the storage array
  */
const updateStorage = (event) => {
  const coordsArr = event.target.id === 'formula-input'
    ? getCoordsArr()
    : event.target.id.split('-');
  saveFormula(storageArr, coordsArr, event.target.value);
  document.getElementById(coordsArr.join('-')).value = parseFormula(event.target.value);
  refreshSheet(storageArr, document);
}

const updateFormulaBar = (event) => {
  const value = getFormula(storageArr, event.target.id.split('-'));
  setCoordsArr(event.target.id.split('-'));
  document.getElementById('formula-input').value = !value
    ? event.target.value || '' || event.target.value === 0 ? event.target.value : ''
    : value || '' || value === 0 ? value : '';
}

const updateSheet = (event) => {
  document.getElementById(getCoordsArr().join('-')).value = event.target.value;
}

/**
  * Choose navigation depending on the input
  */
const navigate = (event) => {
  const oldCoordsArr = event.target.id.split('-');
  const newCoordsArr = event.code === 'Enter' || (event.code === 'ArrowDown' && !event.target.value)
    ? navDown(oldCoordsArr, sheetSize)
    : event.code === 'ArrowUp' && !event.target.value
      ? navUp(oldCoordsArr)
      : event.code === 'ArrowRight' && !event.target.value
        ? navRight(oldCoordsArr, sheetSize)
        : event.code === 'ArrowLeft' && !event.target.value
          ? navLeft(oldCoordsArr)
          : newArray(oldCoordsArr);
  const toId = newCoordsArr.join('-');
  document.getElementById(toId).focus();
}

const updateCell = (event) => {
  document.getElementById('address').value = toAddress(event.target.id.split('-'))
  updateFormulaBar(event);
}

/**
  * Create listeners on all the sheet cells for data entry, data updates and keystrokes
  */
const sheet = document.querySelectorAll('input.cell');
sheet.forEach(cell => cell.addEventListener('change', updateStorage));
sheet.forEach(cell => cell.addEventListener('keydown', navigate));
sheet.forEach(cell => cell.addEventListener('input', updateFormulaBar));
sheet.forEach(cell => cell.addEventListener('focus', updateCell));
document.getElementById('formula-input').addEventListener('input', updateSheet);
document.getElementById('formula-input').addEventListener('change', updateStorage);
