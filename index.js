'use strict';

import { createFormulaBar, refreshFormulaBar } from './components/formulaBar.js';
import { createSheet, navigate, setStyling, refreshCell, refreshStorage } from './components/sheet.js';
import { sheetSize } from './config.js';
import { createStorageArr } from './controllers/storageManager.js';
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
const storageArr = createStorageArr(sheetSize);

/**
  * Getter for the storage array
  */
const getStorageArr = () => storageArr;

/**
  * Event handler for sheet navigation on KeyDown event
  */
const navigateSheet = (event) => navigate(event);

/**
  * Updates the formula in the storage array and recalculates the value
  */
const updateStorage = (event) => refreshStorage(event, getStorageArr());

/**
  * Update the formula bar with the most recent formula edits from the cells
  */
const updateFormulaBar = (event) => refreshFormulaBar(event, getStorageArr());

const updateCell = (event) => {
  document.getElementById('address').value = toAddress(event.target.id.split('-'))
  updateFormulaBar(event);
}

const callRefresh = () => refreshSheetFormula(getStorageArr(), document);

const setBold = (event) => setStyling(storageArr, 'B', getParentDocument(event));

const setItalic = (event) => setStyling(storageArr, 'I', getParentDocument(event));

const setUnderline = (event) => setStyling(storageArr, 'U', getParentDocument(event));

/**
  * Create listeners on all the sheet cells for data entry, data updates and keystrokes
  */
const sheet = document.querySelectorAll('input.cell');
sheet.forEach(cell => cell.addEventListener('keydown', navigateSheet));
sheet.forEach(cell => cell.addEventListener('change', updateStorage));
sheet.forEach(cell => cell.addEventListener('input', updateFormulaBar));
sheet.forEach(cell => cell.addEventListener('focus', updateCell));
document.getElementById('formula-input').addEventListener('change', updateStorage);
document.getElementById('refresh').addEventListener('click', callRefresh);
document.getElementById('formula-input').addEventListener('input', refreshCell);
document.getElementById('format-bold').addEventListener('click', setBold);
document.getElementById('format-italic').addEventListener('click', setItalic);
document.getElementById('format-underline').addEventListener('click', setUnderline);
