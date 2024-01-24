'use strict';

import { sheetSize } from '../config.js';
import { getParentDocument } from './main.js';
import { getCellCoordinatesArr, zeroArray, refreshFormulaBar } from './formulaBar.js';
import { linearToColHeader, linearToRowHeader, linearToGrid, toCellAddress, toCellCoordinates } from '../functions/addressConverter.js';
import { parseFormula } from '../functions/calculator.js';
import { getFormula, saveFormula, getStyling, saveStyling, refreshSheetStyling } from '../controllers/storageManager.js';

const getId = () => 'id';

const getValue = () => 'value';

const getAutocomplete = (i) => i === 0 ? ' autocomplete="none"' : '';

/**
  * Creates a new 2-element array with the same element values
  */
const newArray = (arr) => Array.of(arr[0], arr[1]);

const testForNumericalValue = (str) => /^[\-0-9][\.0-9]*$/.test(str);

/**
  * Creates the grid cells, with the header row and header columns identified in
  * separate classes
  */
function createCells(columns, rows) {
  return Array((columns + 1) * (rows + 1))
    .fill(`<input class="`)
    .map((e, i) => i < (columns + 1)
      ? `${e}col-header" id="${linearToColHeader(i, getId())}"`
        + `${getAutocomplete(i)} disabled="true" type="text" `
        + `value="${linearToColHeader(i, getValue())}" />`
      : i % (columns + 1) === 0
        ? `${e}row-header" id="${linearToRowHeader(i, columns)}"`
          + ` disabled="true" type="text"`
          + ` value="${linearToRowHeader(i, columns)}" />`
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
  elem.style.textAlign = testForNumericalValue(elem.value) && formula.substring(0, 1) !== `'`
    ? 'right'
    : 'left';
}

function setBorderFocusRing(elem, selectCell) {
  elem.style.border = selectCell ? 'solid 2px #2361C5' : 'solid 0.5px #b7b7b7';
}
/**
  * Increment the rows coordinate if not at the limit
  */
const navDown = (cellCoordinatesArr, limit) => arrayTest(cellCoordinatesArr)
  ? Number(cellCoordinatesArr[1]) < limit - 1
    ? Array.of(cellCoordinatesArr[0], (Number(cellCoordinatesArr[1]) + 1))
    : newArray(cellCoordinatesArr)
  : zeroArray();

/**
  * Decrement the rows coordinate if above zero
  */
const navUp = (cellCoordinatesArr) => arrayTest(cellCoordinatesArr)
  ? Number(cellCoordinatesArr[1]) > 0
    ? Array.of(cellCoordinatesArr[0], (Number(cellCoordinatesArr[1]) - 1))
    : newArray(cellCoordinatesArr)
  : zeroArray();

/**
  * Increment the columns coordinate if not at the limit
  */
const navRight = (cellCoordinatesArr, limit) => arrayTest(cellCoordinatesArr)
  ? Number(cellCoordinatesArr[0]) < limit - 1
    ? Array.of((Number(cellCoordinatesArr[0]) + 1), cellCoordinatesArr[1])
    : newArray(cellCoordinatesArr)
  : zeroArray();

/**
  * Decrement the columns coordinate if above zero
  */
const navLeft = (cellCoordinatesArr) => arrayTest(cellCoordinatesArr)
  ? Number(cellCoordinatesArr[0]) > 0
    ? Array.of((Number(cellCoordinatesArr[0]) - 1), cellCoordinatesArr[1])
    : newArray(cellCoordinatesArr)
  : zeroArray();

export function handleDoubleClick(event) {
  // console.log('\'DoubleClick\' pressed.');
  setFocus(event);
  const formula = getFormula(this, getAddress(event));
  getParentDocument(event).getElementById(getAddress(event).join('-')).value = !formula && formula !== 0 ? '' : formula;
}

/**
  * Refresh the entire sheet's formulae
  */
export function refreshSheetValues (event) {
  // console.log('this =', this);
  try {
    if (this && Array.isArray(this) && getParentDocument(event)) {
      this.forEach((colArr, i) => {
        if (colArr && Array.isArray(colArr)) {
          colArr.forEach((cell, j) => {
            if (cell[0]) {
              const cellSheet = getParentDocument(event).getElementById(Array.of(i, j).join('-'));
              cellSheet.value = '';
              cellSheet.value = parseFormula(cell[0], getParentDocument(event), this);
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

export const getAddress = (event) => toCellCoordinates(getParentDocument(event).getElementById('address').value);

export const setFocus = (event) => event.target.focus();

export const clickCell = (event) => {
  event.target.blur();
  getParentDocument(event).querySelectorAll('input.cell').forEach(cell => setBorderFocusRing(cell, false));
  getParentDocument(event).getElementById('address').value = toCellAddress(event.target.id.split('-'));
  setBorderFocusRing(event.target, true);
}

/**
  * Choose navigation depending on the input
  */
export function handleKeyDown(event) {
  // console.log('handleKeyDown event');
  // console.log(getParentDocument(event).activeElement.id);
  // console.log(getParentDocument(event).activeElement.id === 'body');
  if (/[0-9]+-[0-9]+/.test(getParentDocument(event).activeElement.id)
    || getParentDocument(event).activeElement.id === 'body'
    || event.code === 'Enter'
  ) {
    const oldCellCoordinatesArr = toCellCoordinates(getParentDocument(event).getElementById('address').value)
    // console.log(event.code, event.key, event.keyCode);
    if (event.code === 'Tab' ) {
      event.preventDefault();
    }
    if (event.code === 'Enter') {
      getParentDocument(event).getElementById(oldCellCoordinatesArr.join('-')).blur();
    }
    // console.log(oldCellCoordinatesArr);
    if (event.code === 'DoubleClick') {
    } else if (/^Shift/.test(event.code)
      || /^Alt/.test(event.code)
      || /^Meta/.test(event.code)
      || /^Control/.test(event.code)
    ) {
      return;
    } else if (/^Arrow/.test(event.code) || event.code === 'Enter' || event.code === 'Tab') {
      event.target.blur();
      // console.log(event);
      // console.log('event.code =', event.code, '; event.shiftKey?', event.shiftKey);
      const newCellCoordinatesArr = event.code === 'ArrowUp' || (event.code === 'Enter' && event.shiftKey)
        ? navUp(oldCellCoordinatesArr)
        : event.code === 'ArrowLeft' || (event.code === 'Tab' && event.shiftKey)
          ? navLeft(oldCellCoordinatesArr)
          : event.code === 'ArrowRight' || event.code === 'Tab'
            ? navRight(oldCellCoordinatesArr, sheetSize.columns)
            : navDown(oldCellCoordinatesArr, sheetSize.rows);
      // console.log(newCellCoordinatesArr);
      const toId = newCellCoordinatesArr.join('-');
      getParentDocument(event).querySelectorAll('input.cell').forEach(elem => setBorderFocusRing(elem, false));
      setBorderFocusRing(getParentDocument(event).getElementById(toId), true);
      getParentDocument(event).getElementById('address').value = toCellAddress(newCellCoordinatesArr);
      // console.log('this(storageArr) =', this);
      const boundObj = {
        storageArr: this,
        cellCoordinatesArr: newCellCoordinatesArr
      };
      // console.log('boundObj =', boundObj);
      const formulaBar = refreshFormulaBar.bind(boundObj);
      formulaBar(event);
    } else {
      // console.log(getAddress(event).join('-'));
      const elem = getParentDocument(event).getElementById(getAddress(event).join('-'));
      if (getParentDocument(event).activeElement.id !== elem.id) { elem.value = null; }
      elem.focus();
    }
  }
}

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
export function refreshStorage(event) {
  // console.log('this =', this);
  // console.log('this.calcCells =', this.calcCells);
  const cellCoordinatesArr = event.target.id === 'formula-input'
    ? getCellCoordinatesArr()
    : event.target.id.split('-');
  saveFormula(this, cellCoordinatesArr, event.target.value);
  const boundRefresh = refreshSheetValues.bind(this);
  boundRefresh(event);
  // this.calcCells(event);
}

/**
  * Sets up the cell styling and saves it along with the formula
  */
export function setStyling(event) {
  // console.log(this.style);
  // console.log(this.storageArr);
  const cellCoordinatesArr = getAddress(event);
  const styling = getStyling(this.storageArr, cellCoordinatesArr);
  const regexp = new RegExp('[' + this.style[0].toUpperCase() + this.style[0].toLowerCase() + ']', 'g');
  const newStyling = styling && regexp.test(styling)
    ? styling.replaceAll(regexp, '')
    : !styling ? this.style[0].toUpperCase() : styling + this.style[0].toUpperCase();
  saveStyling(this.storageArr, cellCoordinatesArr, newStyling);
  refreshSheetStyling(this.storageArr, getParentDocument(event));
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
