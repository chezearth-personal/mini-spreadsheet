'use strict';

import { linearToColHeader, linearToRowHeader, linearToGrid } from '../functions/addressConverter.js';

const getId = () => 'id';

const getValue = () => 'value';

const getAutocomplete = (i) => i === 0 ? ' autocomplete="none"' : '';

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
  * Creates and array with two elements, each 0
  */
function zeroArray() {
  return Array.of('0', '0');
}

/**
  * Creates a new 2-element array with the same element values
  */
export const newArray = (arr) => Array.of(arr[0], arr[1]);

/**
  * Increment the rows coordinate if not at the limit
  */
export const navDown = (coordsArr, limit) => arrayTest(coordsArr)
  ? Number(coordsArr[1]) < limit - 1
    ? Array.of(coordsArr[0], (Number(coordsArr[1]) + 1).toString())
    : newArray(coordsArr)
  : zeroArray();


/**
  * Decrement the rows coordinate if above zero
  */
export const navUp = (coordsArr) => arrayTest(coordsArr)
  ? Number(coordsArr[1]) > 0
    ? Array.of(coordsArr[0], (Number(coordsArr[1]) - 1).toString())
    : newArray(coordsArr)
  : zeroArray();

/**
  * Increment the columns coordinate if not at the limit
  */
export const navRight = (coordsArr, limit) => arrayTest(coordsArr)
  ? Number(coordsArr[0]) < limit - 1
    ? Array.of((Number(coordsArr[0]) + 1).toString(), coordsArr[1])
    : newArray(coordsArr)
  : zeroArray();

/**
  * Decrement the columns coordinate if above zero
  */
export const navLeft = (coordsArr) => arrayTest(coordsArr)
  ? Number(coordsArr[0]) > 0
    ? Array.of((Number(coordsArr[0]) - 1).toString(), coordsArr[1])
    : newArray(coordsArr)
  : zeroArray();

/**
  * Create the grid DOM elements
  */
export const createSheet = (size) => `
  <main>
    <div id="sheet" style="grid-template-columns:3ch repeat(${size}, 8ch);grid-template-rows:repeat(${size + 1}, 2ch)">
      ${createCells(size)}
      <div id="footer"></div>
    </div>
  </main>
`;
