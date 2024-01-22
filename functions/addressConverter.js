'use strict';

const maxColumns = () => 702; /** Two-letter addresses (27 X 26 : 'A' to 'ZZ') */
const maxRows = () => 32768; /** Just big! */

/**
  * Converts a column letter to a column number (zero-based, limits to max and positive numbers)
  */
function toColNum(address) {
  let col = address
    ? address.toString()
      .toUpperCase()
      .match(/[A-Z]/g)
      .join('')
      .padStart(2, '@')
      .split('')
      .reverse()
      .reduce((r, e, i) => r + (e.charCodeAt(0) - 64) * Math.pow(26, i), -1)
    : 1;
  return col > 0
    ? col < maxColumns() + 1
      ? col
      : maxColumns()
    : 0;
}

/**
  * Converts a row address to a row number (zero-based, limits to max and positive numbers)
  */
function toRowNum(address) {
  let row = address ? address.toString().match(/[0-9]/g).join('') : 1;
  return !isNaN(Number(row)) && row > 0
    ? Number(row) < Math.min(maxColumns(), maxRows()) + 1
      ? Number(row) - 1
      : Math.min(maxColumns(), maxRows())
    : 0;
}

/**
  * Converts a linear array position to row or column header values
  */
export const linearToColHeader = (pos, attribute) => pos === 0
    ? attribute === 'id' ? 'address' : ''
    : attribute === 'id' ? toColAddr(pos - 1).toLowerCase() : toColAddr(pos - 1).toUpperCase();

/**
  */
export const linearToRowHeader = (pos, columns) => toRowAddr(Math.floor(pos / (columns + 1)) - 1);

/**
  * Converts a linear array position to cell grid coordinates (zero-based)
  */
export const linearToGrid = (pos, columns) => (pos % (columns + 1) - 1).toString()
  + '-'
  + (Math.floor(pos / (columns + 1) - 1)).toString();

/**
  * Converts a coordinate number to a column letter on the grid
  */
export const toColAddr = (colNum) => colNum > -1
    ? colNum < Math.min(maxColumns(), maxRows())
      ? (colNum > 25 ? String.fromCharCode(Math.floor(colNum / 26) + 64) : '')
        + String.fromCharCode((colNum % 26) + 65)
      : 'ZZ'
    : 'A';

/**
  * Converts a coordinate number to a row number on the grid
  */
export const toRowAddr = (rowNum) => {
  if (!isNaN(Number(rowNum))) {
    const rowInt = Math.floor(rowNum);
    if (rowInt > 0) {
      return rowInt < Math.min(maxColumns(), maxRows()) ? (rowInt + 1).toString() : Math.min(maxColumns(), maxRows()).toString();
    }
    return '1';
  }
}

/**
  * Tests for a valid address
  */
export const isAddress = (address) => !!address
    && address.toString().length > 1
    && /^([A-Z]+)([0-9]+)$/.test(address.toString().toUpperCase());

/**
  * Tests for valid coordinates
  */
export const isCoordinates = (coordArr) => Array.isArray(coordArr) && coordArr.length > 1 && !isNaN(coordArr[0]) && !isNaN(coordArr[1]);

/**
  * Converts addresses in the form 'A23' or 'AZ7' to arrays of coordinates, e.g. [1, 23] or [52, 7]
  */
export const toCoords = (address) => isAddress(address)
    ? Array.of(toColNum(address), toRowNum(address))
    : [0, 0];

/**
  * Converts a coordinate array e.g. [3, 31], to an alphanumeric address, e.g. 'C31'
  */
export const toAddress = (coordArr) => isCoordinates(coordArr)
    ? (toColAddr(coordArr[0]) + toRowAddr(coordArr[1])).toString()
    : 'A1';
