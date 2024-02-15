'use strict';

import { configs } from './config.js';
import { createFormulaBar,
  refreshFormulaBar,
  updateFormulaBar } from './components/formulaBar.js';
import { createSheet,
  refreshSheetValues,
  clickCell,
  handleKeyDown,
  handleStyling,
  refreshCell,
  refreshStorage,
  handleDoubleClick} from './components/sheet.js';
import { createStorageArr } from './controllers/storageManager.js';

/**
  * Get the main configuration settings as objects
  */
const getSheetSize = () => configs.sheetSize;
const getBuiltInFunctions = () => configs.builtInFunctions;

/**
  * Creates an array (2 dimesions: `sheetSize.columns` x `sheetSize.rows`) for storing formulae
  */
const storageArr = createStorageArr(getSheetSize().columns, getSheetSize().rows);

/**
  * Getter for the storage array
  */
const getStorageArr = () => storageArr;

/**
  * Creates the formula bar and grid on the page, with one additional row and column for the
  * address heading
  */
document.querySelector('#app').innerHTML = `
  ${createFormulaBar()}
  ${createSheet(getSheetSize())}
`;

/**
  * Update the formula bar with the most recent formula edits from the cells
  */
const createBoundObj = (cell) => ({
  storageArr: getStorageArr(),
  sheetSize: getSheetSize(),
  builtInFunctions: getBuiltInFunctions(),
  cellCoordinatesArr: cell ? cell.id.split('-') : null
});

/**
  * Create listeners on all the sheet cells for data entry, data updates and keystrokes
  */
const sheet = document.querySelectorAll('input.cell');
document.addEventListener('keydown', handleKeyDown.bind(createBoundObj()));
sheet.forEach(cell => cell.addEventListener('click', clickCell));
sheet.forEach(cell => cell.addEventListener('change', refreshStorage.bind(createBoundObj())));
sheet.forEach(cell => cell.addEventListener('input', refreshFormulaBar.bind(createBoundObj(cell))));
sheet.forEach(cell => cell.addEventListener('dblclick', handleDoubleClick.bind(getStorageArr())));
sheet.forEach(cell => cell.addEventListener('focus', refreshFormulaBar.bind(createBoundObj(cell))));
document
  .getElementById('formula-input')
  .addEventListener('change', updateFormulaBar.bind(createBoundObj()));
document
  .getElementById('refresh')
  .addEventListener('click', refreshSheetValues.bind(
    createBoundObj()
  ));
document.getElementById('formula-input').addEventListener('input', refreshCell);
document
  .getElementById('format-bold')
  .addEventListener('click', handleStyling.bind(
    { storageArr: getStorageArr(), style: 'B' }
  ));
document
  .getElementById('format-italic')
  .addEventListener('click', handleStyling.bind(
    { storageArr: getStorageArr(), style: 'I' }
  ));
document
  .getElementById('format-underline')
  .addEventListener('click', handleStyling.bind(
    { storageArr: getStorageArr(), style: 'U' }
  ));
