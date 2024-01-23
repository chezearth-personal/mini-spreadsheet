'use strict';

import { createFormulaBar, refreshFormulaBar, updateFormulaBar } from './components/formulaBar.js';
import { createSheet,
  refreshSheetValues,
  clickCell,
  handleKeyDown,
  setStyling,
  refreshCell,
  refreshStorage,
  handleDoubleClick
} from './components/sheet.js';
import { sheetSize } from './config.js';
import { createStorageArr } from './controllers/storageManager.js';

/**
  * Getter for the storage array
  */
const getStorageArr = () => storageArr;

/**
  * Creates an array (2 dimesions: `sheetSize.columns` x `sheetSize.rows`) for storing formulae
  */
const storageArr = createStorageArr(sheetSize.columns, sheetSize.rows);

/**
  * Creates the formula bar and grid on the page, with one additional row and column for the
  * address heading
  */
document.querySelector('#app').innerHTML = `
  ${createFormulaBar()}
  ${createSheet()}
`;

/**
  * Update the formula bar with the most recent formula edits from the cells
  */
const createBoundObj = (cell) => ({
  storageArr: getStorageArr(),
  cellCoordinatesArr: cell.id.split('-')
});

/**
  * Create listeners on all the sheet cells for data entry, data updates and keystrokes
  */
const sheet = document.querySelectorAll('input.cell');
// console.log(document.getElementById('sheet'));
document.addEventListener('keydown', handleKeyDown.bind(getStorageArr()));
// document.querySelector('#sheet').addEventListener('keydown', handleKeyDown.bind(getStorageArr()));
// sheet.forEach(cell => { console.log(cell); cell.addEventListener('keydown', handleKeyDown.bind(getStorageArr())); });
sheet.forEach(cell => cell.addEventListener('click', clickCell));
sheet.forEach(cell => cell.addEventListener('change', refreshStorage.bind(getStorageArr())));
sheet.forEach(cell => cell.addEventListener('input', refreshFormulaBar.bind(createBoundObj(cell))));
sheet.forEach(cell => cell.addEventListener('dblclick', handleDoubleClick.bind(getStorageArr())));
sheet.forEach(cell => cell.addEventListener('focus', refreshFormulaBar.bind(createBoundObj(cell))));
// document
  // .getElementById('formula-input')
  // .addEventListener('change', refreshStorage.bind(getStorageArr()));
document
  .getElementById('formula-input')
  .addEventListener('change', updateFormulaBar.bind(getStorageArr()));
document
  .getElementById('refresh')
  .addEventListener('click', refreshSheetValues.bind(getStorageArr()));
document.getElementById('formula-input').addEventListener('input', refreshCell);
document
  .getElementById('format-bold')
  .addEventListener('click', setStyling.bind({ storageArr: getStorageArr() , style: 'B' }));
document
  .getElementById('format-italic')
  .addEventListener('click',setStyling.bind({ storageArr: getStorageArr(), style: 'I' }));
document
  .getElementById('format-underline')
  .addEventListener('click', setStyling.bind({ storageArr: getStorageArr(), style: 'U' }));
