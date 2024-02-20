'use strict';

import configs from './config.json' assert {type: 'json'};
import { parse } from 'yaml';
import { createFormulaBar,
  refreshFormulaBar,
  updateFormulaBar } from './components/formulaBar.js';
import { createSheet,
  refreshSheetValues,
  clickCell,
  refreshCell,
  refreshStorage,
  handleKeyDown,
  handleStyling,
  handleColumnWidth,
  releaseColumnWidth,
  handleRowHeight,
  releaseRowHeight,
  handleDoubleClick} from './components/sheet.js';
import { createStorageArr } from './controllers/storageManager.js';

/**
  * Getters for the main configuration settings
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
document.addEventListener('keydown', handleKeyDown.bind(createBoundObj()));
const sheet = document.querySelectorAll('input.cell-input');
sheet.forEach(cellInput => cellInput.addEventListener('click', clickCell));
sheet.forEach(cellInput => cellInput
  .addEventListener('change', refreshStorage.bind(createBoundObj()))
);
sheet.forEach(cellInput => cellInput
  .addEventListener('input', refreshFormulaBar.bind(createBoundObj(cellInput)))
);
sheet.forEach(cellInput => cellInput
  .addEventListener('dblclick', handleDoubleClick.bind(getStorageArr()))
);
sheet.forEach(cellInput => cellInput
  .addEventListener('focus', refreshFormulaBar.bind(createBoundObj(cellInput)))
);
const colAdjust = document.querySelectorAll('div.col-marker');
colAdjust.forEach(width => width.addEventListener('mousedown', handleColumnWidth));
colAdjust.forEach(width => width.addEventListener('mouseup', releaseColumnWidth));
const rowAdjust = document.querySelectorAll('div.row-marker');
rowAdjust.forEach(height => height.addEventListener('mousedown', handleRowHeight));
rowAdjust.forEach(height => height.addEventListener('mouseup', releaseRowHeight));
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
