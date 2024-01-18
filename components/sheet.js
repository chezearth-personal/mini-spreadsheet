'use strict';

import { sheetSize } from '../config.js';
import { getParentDocument } from './main.js';
import { getCellCoordinatesArr, zeroArray } from './formulaBar.js';
import { linearToColHeader, linearToRowHeader, linearToGrid } from '../functions/addressConverter.js';
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
function createCells(size) {
  return Array(Math.pow(size + 1, 2))
    .fill(`<input class="`)
    .map((e, i) => i < (size + 1)
      ? `${e}col-header" id="${linearToColHeader(i, getId())}"${getAutocomplete(i)} disabled="true" type="text" value="${linearToColHeader(i, getValue())}" />`
      : i % (size + 1) === 0
        ? `${e}row-header" id="${linearToRowHeader(i, size)}" disabled="true" type="text" value="${linearToRowHeader(i, size)}" />`
        : `${e}cell" id=${linearToGrid(i, size)} type="text" />`)
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
const navRight = (coordsArr, limit) => arrayTest(coordsArr)
  ? Number(coordsArr[0]) < limit - 1
    ? Array.of((Number(coordsArr[0]) + 1).toString(), coordsArr[1])
    : newArray(coordsArr)
  : zeroArray();

/**
  * Decrement the columns coordinate if above zero
  */
const navLeft = (coordsArr) => arrayTest(coordsArr)
  ? Number(coordsArr[0]) > 0
    ? Array.of((Number(coordsArr[0]) - 1).toString(), coordsArr[1])
    : newArray(coordsArr)
  : zeroArray();

/**
  * Choose navigation depending on the input
  */
export const navigate = (event) => {
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
  getParentDocument(event).getElementById(toId).focus();
}

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
export const createSheet = (size) => `
  <main>
    <div id="sheet" style="grid-template-columns:3ch repeat(${size}, 8ch);grid-template-rows:repeat(${size + 1}, 2ch)">
      ${createCells(size)}
    </div>
  </main>
`;
