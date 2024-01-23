'use strict';

import { createFormulaBar, refreshFormulaBar } from './components/formulaBar.js';
import { createSheet, clickCell, navigate, setFocus, setStyling, refreshCell, refreshStorage } from './components/sheet.js';
import { sheetSize } from './config.js';
import { createStorageArr } from './controllers/storageManager.js';
// import { toAddress } from './functions/addressConverter.js';

/**
  * Creates the formula bar and grid on the page, with one additional row and column for the
  * address heading
  */
document.querySelector('#app').innerHTML = `
  ${createFormulaBar()}
  ${createSheet()}
`;

/**
  * Creates an array (2 dimesions: `sheetSize.columns` x `sheetSize.rows`) for storing formulae
  */
const storageArr = createStorageArr(sheetSize.columns, sheetSize.rows);
// console.log(storageArr);

/**
  * Getter for the storage array
  */
const getStorageArr = () => storageArr;

/**
  * Updates the formula in the storage array and recalculates the value
  */
const updateStorage = (event) => refreshStorage(event, getStorageArr());

/**
  * Update the formula bar with the most recent formula edits from the cells
  */
const updateFormulaBar = (event) => refreshFormulaBar(getStorageArr(), event, event.target.id.split('-'));

const updateCell = (event) => {
  updateFormulaBar(event);
}

function navigateSheet(event) {
  console.log(this);
}
const callRefresh = () => refreshSheetFormula(getStorageArr(), document);

const setBold = (event) => setStyling(storageArr, 'B', getParentDocument(event));

const setItalic = (event) => setStyling(storageArr, 'I', getParentDocument(event));

const setUnderline = (event) => setStyling(storageArr, 'U', getParentDocument(event));

/**
  * Create listeners on all the sheet cells for data entry, data updates and keystrokes
  */
const sheet = document.querySelectorAll('input.cell');
document.addEventListener('keydown', navigate.bind(storageArr));
// sheet.forEach(cell => cell.addEventListener('keydown', navigate));
sheet.forEach(cell => cell.addEventListener('click', clickCell));
sheet.forEach(cell => cell.addEventListener('change', updateStorage));
sheet.forEach(cell => cell.addEventListener('input', updateFormulaBar));
sheet.forEach(cell => cell.addEventListener('dblclick', setFocus));
sheet.forEach(cell => cell.addEventListener('focus', updateCell));
document.getElementById('formula-input').addEventListener('change', updateStorage);
document.getElementById('refresh').addEventListener('click', callRefresh);
document.getElementById('formula-input').addEventListener('input', refreshCell);
document.getElementById('format-bold').addEventListener('click', setBold);
document.getElementById('format-italic').addEventListener('click', setItalic);
document.getElementById('format-underline').addEventListener('click', setUnderline);
