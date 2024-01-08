'use strict';

// import './style.css' assert {type: 'css' };
import { createFormulaBar, setCoordsArr, getCoordsArr } from './components/formulaBar.js';
import { createSheet, newArray, navDown, navUp, navRight, navLeft } from './components/sheet.js';
import { sheetSize } from './config.js';
import { 
  createStorage,
  getFormula,
  getStyling,
  saveFormula,
  saveStyling, 
  refreshSheetFormula,
  refreshSheetStyling
} from './controllers/storageManager.js';
import { toAddress } from './functions/addressConverter.js';

/**
  * Creates the formula bar and grid on the page, with one additional row and column for the
  * address heading
  */
document.querySelector('#app').innerHTML = `
  ${createFormulaBar(sheetSize)}
  ${createSheet(sheetSize)}
`;

/**
  * Creates an array (2 dimesions: `sheetSize` x `sheetSize`) for storing formulae
  */
export const storageArr = createStorage(sheetSize);

/**
  * Getter for the storage array
  */
const getStorageArr = () => storageArr;

/**
  * Updates the formula in the storage array and recalculates the value
  */
const updateStorage = (event) => {
  const coordsArr = event.target.id === 'formula-input'
    ? getCoordsArr()
    : event.target.id.split('-');
  saveFormula(getStorageArr(), coordsArr, event.target.value);
  refreshSheetFormula(getStorageArr(), document);
}

/**
  * Update the formula bar with the most recent formula edits from the cells
  */
const updateFormulaBar = (event) => {
  const formula = getFormula(storageArr, event.target.id.split('-'));
  setCoordsArr(event.target.id.split('-'));
  document.getElementById('formula-input').value = !formula
    ? event.target.value || '' || event.target.value === 0
      ? event.target.value
      : ''
    : formula || '' || formula === 0 ? formula : '';
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

const callRefresh = () => {
  refreshSheetFormula(getStorageArr(), document);
}

const setStyling = (storageArr, style) => {
  const coordsArr = getCoordsArr();
  const styling = getStyling(storageArr, coordsArr);
  const regexp = new RegExp('[' + style[0].toUpperCase() + style[0].toLowerCase() + ']', 'g');
  const newStyling = styling && regexp.test(styling)
    ? styling.replaceAll(regexp, '')
    : !styling ? style[0].toUpperCase() : styling + style[0].toUpperCase();
  saveStyling(storageArr, coordsArr, newStyling);
  refreshSheetStyling(storageArr, document);
}

const setBold = () => {
  setStyling(storageArr, 'B');
}

const setItalic = () => {
  setStyling(storageArr, 'I');
}

const setUnderline = () => {
  setStyling(storageArr, 'U');
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
document.getElementById('refresh').addEventListener('click', callRefresh);
document.getElementById('format-bold').addEventListener('click', setBold);
document.getElementById('format-italic').addEventListener('click', setItalic);
document.getElementById('format-underline').addEventListener('click', setUnderline);
