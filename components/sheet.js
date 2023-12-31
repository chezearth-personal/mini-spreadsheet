import { toRowAddr, toColAddr, linearToGrid } from '../functions/addressConverter';

/**
  * Constructor functions for the cells
  */
function makeHeader(pos, size) {
  return pos % (size + 1) === 0 && pos > size
    ? toRowAddr(pos / (size + 1) - 1)
    : pos === 0 ? '' : toColAddr(pos - 1);
}

function makeAddressCell(pos) {
  return pos === 0 ? ` id="address"` : ``;
}

function createCells(size) {
  return Array(Math.pow(size + 1, 2))
    .fill(`<input class=`)
    .map((e, i) => i % (size + 1) === 0 || i < size + 2
      ? `${e}"grid-header"${makeAddressCell(i)} disabled="true" type="text" value="${makeHeader(i, size)}" />`
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
    <div class="sheet" style="grid-template-columns:5ch repeat(${size}, 14ch)">
      ${createCells(size)}
    </div>
`;
