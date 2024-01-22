'use strict';

import { sheetSize } from '../config.js';
import { getParentDocument } from './main.js';
import { getCellCoordinatesArr, zeroArray } from './formulaBar.js';
import { linearToColHeader, linearToRowHeader, linearToGrid, toAddress, toCoords } from '../functions/addressConverter.js';
import { parseFormula } from '../functions/calculator.js';
import { saveFormula, getStyling, saveStyling, refreshSheetStyling } from '../controllers/storageManager.js';

const getId = () => 'id';

const getValue = () => 'value';

const getAutocomplete = (i) => i === 0 ? ' autocomplete="none"' : '';

/**
  * Creates a new 2-element array with the same element values
  */
const newArray = (arr) => Array.of(arr[0], arr[1]);

/**
  * Creates the grid cells, with the header row and header columns identified in
  * separate classes
  */
function createCells(columns, rows) {
  return Array((columns + 1) * (rows + 1))
    .fill(`<input class="`)
    .map((e, i) => i < (columns + 1)
      ? `${e}col-header" id="${linearToColHeader(i, getId())}"${getAutocomplete(i)} disabled="true" type="text" value="${linearToColHeader(i, getValue())}" />`
      : i % (columns + 1) === 0
        ? `${e}row-header" id="${linearToRowHeader(i, columns)}" disabled="true" type="text" value="${linearToRowHeader(i, columns)}" />`
        : `${e}cell" id=${linearToGrid(i, columns)} type="text" />`)
    .join('\n');
}

/**
  * Array helpers
  */
function arrayTest(arr) {
  return Array.isArray(arr)
    && !isNaN(Number(arr[0]))
    && !isNaN(Number(arr[1]))
}

/**
  * Sets up the alignment based on whether the data are text or numbers
  */
function setAlignment(elem, formula) {
  if (/^[0-9]+$/.test(elem.value) && formula.substring(0, 1) !== `'`) {
    elem.style.textAlign = 'right';
  } else {
    elem.style.textAlign = 'left';
  }
}

function setBorderFocusRing(elem, selectCell) {
  if (selectCell) {
    // elem.style.borderColor = '#2361C5';
    elem.style.border = 'solid 2px #2361C5';
  } else {
    elem.style.border = 'solid 0.5px #b7b7b7';
    // elem.style.border = '0.5px';
  }
}
/**
  * Increment the rows coordinate if not at the limit
  */
const navDown = (cellCoordinatesArr, limit) => arrayTest(cellCoordinatesArr)
  ? Number(cellCoordinatesArr[1]) < limit - 1
    ? Array.of(cellCoordinatesArr[0], (Number(cellCoordinatesArr[1]) + 1).toString())
    : newArray(cellCoordinatesArr)
  : zeroArray();

/**
  * Decrement the rows coordinate if above zero
  */
const navUp = (cellCoordinatesArr) => arrayTest(cellCoordinatesArr)
  ? Number(cellCoordinatesArr[1]) > 0
    ? Array.of(cellCoordinatesArr[0], (Number(cellCoordinatesArr[1]) - 1).toString())
    : newArray(cellCoordinatesArr)
  : zeroArray();

/**
  * Increment the columns coordinate if not at the limit
  */
const navRight = (cellCoordinatesArr, limit) => arrayTest(cellCoordinatesArr)
  ? Number(cellCoordinatesArr[0]) < limit - 1
    ? Array.of((Number(cellCoordinatesArr[0]) + 1).toString(), cellCoordinatesArr[1])
    : newArray(cellCoordinatesArr)
  : zeroArray();

/**
  * Decrement the columns coordinate if above zero
  */
const navLeft = (cellCoordinatesArr) => arrayTest(cellCoordinatesArr)
  ? Number(cellCoordinatesArr[0]) > 0
    ? Array.of((Number(cellCoordinatesArr[0]) - 1).toString(), cellCoordinatesArr[1])
    : newArray(cellCoordinatesArr)
  : zeroArray();

/**
  * Refresh the entire sheet's formulae
  */
const refreshSheetValues = (storageArr, doc) => {
  try {
    if (storageArr && Array.isArray(storageArr) && doc) {
      storageArr.forEach((colArr, i) => {
        if (colArr && Array.isArray(colArr)) {
          colArr.forEach((cell, j) => {
            if (cell[0]) {
              const cellSheet = doc.getElementById(Array.of(i,j).join('-'));
              cellSheet.value = '';
              cellSheet.value = parseFormula(cell[0], doc, storageArr);
              setAlignment(cellSheet, cell[0]);
            }
          });
        }
      });
    }
    return -1;
  } catch (e) {
    console.log(e);
    return 0;
  }
}

const getAddress = (event) => toCoords(getParentDocument(event).getElementById('address').value);

export const clickCell = (event) => {
  event.target.blur();
  getParentDocument(event).querySelectorAll('input.cell').forEach(cell => setBorderFocusRing(cell, false));
  getParentDocument(event).getElementById('address').value = toAddress(event.target.id.split('-'));
  setBorderFocusRing(event.target, true);
}

/**
  * Choose navigation depending on the input
  */
export const navigate = (event) => {
  // const oldCellCoordinatesArr = event.target.id.split('-');
  const oldCellCoordinatesArr = getAddress(event);
  console.log(oldCellCoordinatesArr);
  // const oldCellCoordinatesArr = toCoords(getParentDocument(event).getElementById('address').value)
  if (event.code === 'DoubleClick') {
    comsole.log('\'DoubleClick\' pressed.');
    setFocus(event);
  } else {
  // const newCellCoordinatesArr = event.code === 'Click'
  const newCellCoordinatesArr = event.code === 'Enter' || (event.code === 'ArrowDown' && !event.target.value)
      ? navDown(oldCellCoordinatesArr, sheetSize.rows)
      : event.code === 'ArrowUp' && !event.target.value
        ? navUp(oldCellCoordinatesArr)
        : event.code === 'ArrowRight' && !event.target.value
          ? navRight(oldCellCoordinatesArr, sheetSize.columns)
          : event.code === 'ArrowLeft' && !event.target.value
            ? navLeft(oldCellCoordinatesArr)
            : newArray(oldCellCoordinatesArr);
  console.log(newCellCoordinatesArr);
  const toId = newCellCoordinatesArr.join('-');
  console.log(toId);
  getParentDocument(event).querySelectorAll('input.cell').forEach(elem => setBorderFocusRing(elem, false));
  setBorderFocusRing(getParentDocument(event).getElementById(toId), true);
  getParentDocument(event).getElementById('address').value = toAddress(newCellCoordinatesArr);
  event.target.blur();
  }
  // getParentDocument(event).getElementById(toId).focus();
}

export const setFocus = (event) => event.target.focus();

/**
  * Updates the cell value
  */
export const refreshCell = (event) => {
  getParentDocument(event)
    .getElementById(getCellCoordinatesArr()
    .join('-'))
    .value = event.target.value;
}

/**
  * Updates the formula in the storage array and recalculates all values
  */
export const refreshStorage = (event, storageArr) => {
  const cellCoordinatesArr = event.target.id === 'formula-input'
    ? getCellCoordinatesArr()
    : event.target.id.split('-');
  saveFormula(storageArr, cellCoordinatesArr, event.target.value);
  refreshSheetValues(storageArr, getParentDocument(event));
}

export const setStyling = (storageArr, style, doc) => {
  const coordsArr = getCellCoordinatesArr();
  const styling = getStyling(storageArr, coordsArr);
  const regexp = new RegExp('[' + style[0].toUpperCase() + style[0].toLowerCase() + ']', 'g');
  const newStyling = styling && regexp.test(styling)
    ? styling.replaceAll(regexp, '')
    : !styling ? style[0].toUpperCase() : styling + style[0].toUpperCase();
  saveStyling(storageArr, coordsArr, newStyling);
  refreshSheetStyling(storageArr, doc);
}

/**
  * Create the grid DOM elements
  */
export const createSheet = () => `
  <main>
    <div id="sheet"
      style="grid-template-columns:${sheetSize.cells.rowHeaderWidth} repeat(${sheetSize.columns}, ${sheetSize.cells.width});grid-template-rows:repeat(${sheetSize.rows + 1}, 2ch)">
      ${createCells(sheetSize.columns, sheetSize.rows)}
    </div>
  </main>
`;
