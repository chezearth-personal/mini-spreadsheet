'use strict';

import { getParentDocument } from './main.js';
import { getCellCoordinatesArr, zeroArray, refreshFormulaBar } from './formulaBar.js';
import {
  linearToColHeader,
  linearToRowHeader,
  linearToGrid,
  toCellAddress,
  toCellCoordinates } from '../functions/addressConverter.js';
import { parseExpression } from '../functions/calculator.js';
import {
  getFormula,
  saveFormula,
  getStyling,
  saveStyling } from '../controllers/storageManager.js';

const getId = () => 'id';

const getValue = () => 'value';

/**  */
// const calculateWidth = (i, sheetSize) => (
  // i % (sheetSize.columns + 1) === 0
    // ? sheetSize.cells.rowHeaderWidth 
    // : sheetSize.cells.width
  // ).toString();

/**
  * Makes the HTML text for the cell at the top of the sheet with the column letter header
  */
const makeColumnHeaderCell = (e, i) => `${e}"col" id="col-${linearToColHeader(i, getId())}">
        <input class="col-header" id="${linearToColHeader(i, getId())}" disabled="true" type="text" value="${linearToColHeader(i, getValue())}" />${i === 0 ? `` : `
        <div class="col-marker" id="col-marker-${linearToColHeader(i, getId())}"></div>`}
      </div>`;

/**
  * Makes the HTML text for the cell at the left of the sheet with the row number header
  */
const makeRowHeaderCell = (e, i, columns) => `${e}"row" id="row-${linearToRowHeader(i, columns)}">
      <input class="row-header" id="${linearToRowHeader(i, columns)}" disabled="true" type="text"value="${linearToRowHeader(i, columns)}" />
      <div class="row-marker" id="row-marker-${linearToRowHeader(i, columns)}"></div>
    </div>`;

/**
  * Makes the blank cells in the body of the sheet
  */
const makeSheetCell = (i, columns) => `    <input class="cell" id=${linearToGrid(i, columns)} type="text" />`;

/**
  * Decides whether to make row header cell (left-most column) or a sheet cell
  */
const makeRowCell = (e, i, sheetSize) => i % (sheetSize.columns + 1) === 0 
  ? makeRowHeaderCell(e, i, sheetSize.columns)
  : makeSheetCell(i, sheetSize.columns);

/**
  * Creates a new 2-element array with the same element values
  */
const newArray = (arr) => Array.of(arr[0], arr[1]);

/**
  * Tests for a string that is purely numerical
  */
const testForNumericalValue = (str) => /^[\-\+\.0-9][\.0-9]*$/.test(str);

/**
  * Creates the grid cells, with the header row and header columns identified in
  * separate classes
  */
function createCells(sheetSize) {
  return Array((sheetSize.columns + 1) * (sheetSize.rows + 1))
    .fill(`      <div class=`)
    .map((e, i) => i < (sheetSize.columns + 1)
      ? makeColumnHeaderCell(e, i)
      : makeRowCell(e, i, sheetSize))
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

/**
  * Set an element's styling according to a formatting string
  */
function setStyling(styling, elem) {
  if (elem) {
    elem.style.fontWeight = !styling || !/[Bb]/.test(styling) ? 'normal' : 'bold';
    elem.style.fontStyle = !styling || !/[Ii]/.test(styling) ? 'normal' : 'italic';
    elem.style.textDecorationLine = !styling || !/[Uu]/.test(styling) ? 'none' : 'underline';
  }
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
  setFocus(event);
  const formula = getFormula(this, getAddress(event));
  getParentDocument(event).getElementById(getAddress(event).join('-')).value = !formula && formula !== 0 ? '' : formula;
}

/**
  * Refresh the entire sheet's formatting
  */
const refreshSheetStyling = (storageArr, doc) => {
  try {
    if (storageArr && Array.isArray(storageArr) && doc) {
      storageArr.forEach((colArr, i) => {
        if (colArr && Array.isArray(colArr)) {
          colArr.forEach((cell, j) => {
              const cellSheet = doc.getElementById(Array.of(i, j).join('-'));
              setStyling(cell[1], cellSheet);
          });
        }
      });
    }
  } catch (e) {
    console.log(e);
  }
}

/**
  * Refresh the entire sheet's formulae
  */
export function refreshSheetValues (event) {
  if (this.storageArr && Array.isArray(this.storageArr) && getParentDocument(event)) {
    this.storageArr.forEach((colArr, i) => {
      if (colArr && Array.isArray(colArr)) {
        colArr.forEach((cell, j) => {
          if (cell[0] || cell[0] === 0) {
            const cellSheet = getParentDocument(event).getElementById(Array.of(i, j).join('-'));
            cellSheet.value = '';
            try {
              cellSheet.value = parseExpression(cell[0], this);
            } catch(e) {
              console.log(e);
              cellSheet.value = '#ERROR!';
            }
            setAlignment(cellSheet, cell[0]);
          }
        });
      }
    });
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
  if (/[0-9]+-[0-9]+/.test(getParentDocument(event).activeElement.id)
    || getParentDocument(event).activeElement.id === 'body'
    || event.code === 'Enter'
    || getParentDocument(event).activeElement.id === 'formula-input' && event.code === 'Tab'
  ) {
    const oldCellCoordinatesArr = toCellCoordinates(getParentDocument(event).getElementById('address').value)
    if (event.code === 'Tab' ) {
      event.preventDefault();
    }
    if (event.code === 'Enter') {
      getParentDocument(event).getElementById(oldCellCoordinatesArr.join('-')).blur();
    }
    if (event.code === 'DoubleClick') {
    } else if (/^Shift/.test(event.code)
      || /^Alt/.test(event.code)
      || /^Meta/.test(event.code)
      || /^Control/.test(event.code)
    ) {
      return;
    } else if (/^Arrow/.test(event.code) || event.code === 'Enter' || event.code === 'Tab') {
      event.target.blur();
      const newCellCoordinatesArr = event.code === 'ArrowUp' || (event.code === 'Enter' && event.shiftKey)
        ? navUp(oldCellCoordinatesArr)
        : event.code === 'ArrowLeft' || (event.code === 'Tab' && event.shiftKey)
          ? navLeft(oldCellCoordinatesArr)
          : event.code === 'ArrowRight' || event.code === 'Tab'
            ? navRight(oldCellCoordinatesArr, this.sheetSize.columns)
            : navDown(oldCellCoordinatesArr, this.sheetSize.rows);
      const toId = newCellCoordinatesArr.join('-');
      getParentDocument(event).querySelectorAll('input.cell').forEach(elem => setBorderFocusRing(elem, false));
      const sheetValues = refreshSheetValues.bind(this);
      sheetValues(event);
      setBorderFocusRing(getParentDocument(event).getElementById(toId), true);
      getParentDocument(event).getElementById('address').value = toCellAddress(newCellCoordinatesArr);
      const boundObj = {
        storageArr: this.storageArr,
        cellCoordinatesArr: newCellCoordinatesArr
      };
      const formulaBar = refreshFormulaBar.bind(boundObj);
      formulaBar(event);
    } else {
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
  const cellCoordinatesArr = event.target.id === 'formula-input'
    ? getCellCoordinatesArr()
    : event.target.id.split('-');
  saveFormula(this.storageArr, cellCoordinatesArr, event.target.value);
  const boundRefresh = refreshSheetValues.bind(this);
  boundRefresh(event);
}

/**
  * Sets up the cell styling and saves it along with the formula
  */
export function handleStyling(event) {
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
export const createSheet = (sheetSize) => `
  <main>
    <div id="sheet" style="grid-template-columns:${sheetSize.cells.rowHeaderWidth} `
        + `repeat(${sheetSize.columns}, ${sheetSize.cells.width});`
        + `grid-template-rows:repeat(${sheetSize.rows + 1}, ${sheetSize.cells.height})">
${createCells(sheetSize)}
    </div>
  </main>
`;
