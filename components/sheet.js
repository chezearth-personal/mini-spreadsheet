'use strict';

import { linearToHeader, linearToGrid } from '../functions/addressConverter';

/**
  * Creates the grid cells, with the header row and header columns identified separately
  */
function createCells(size) {
  const id = 'id';
  const value = 'value';
  return Array(Math.pow(size + 1, 2))
    .fill(`<input class=`)
    .map((e, i) => i % (size + 1) === 0 || i < size + 2
      ? `${e}"grid-header" id="${linearToHeader(i, size, id)}" ${i === 0 ? ' autocomplete="none"' : ''} disabled="true" type="text" value="${linearToHeader(i, size, value)}" />`
      : `${e}"cell" id=${linearToGrid(i, size)} type="text" />`
    )
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
    <main class="sheet" style="grid-template-columns:5ch repeat(${size}, 10ch)">
      ${createCells(size)}
    </main>
`;
