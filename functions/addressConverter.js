'use strict';

/**
  * Converts a column letter to a column number (zero-based, limits to 100 and positive numbers)
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
    ? col < 101
      ? col
      : 100
    : 0;
}

/**
  * Converts a row address to a row number (zero-based, limits to 100 and positive numbers)
  */
function toRowNum(address) {
  let row = address ? address.toString().match(/[0-9]/g).join('') : 1;
  return !isNaN(Number(row)) && row > 0
    ? Number(row) < 101
      ? Number(row) - 1
      : 100
    : 0;
}

/**
  * Converts a linear array position to row or column header values
  */
export function linearToHeader(pos, size, attribute) {
  return pos === 0
    ? attribute === 'id' ? 'address' : ''
    : pos > 0 && pos <= size
      ? attribute === 'id' ? toColAddr(pos - 1).toLowerCase() : toColAddr(pos - 1).toUpperCase()
      : toRowAddr(Math.floor(pos / size) - 1);
}

/**
  * Converts a linear array position to cell grid coordinates (zero-based)
  */
export function linearToGrid(pos, size) {
  return (pos % (size + 1) - 1).toString()
    + '-'
    + (Math.floor(pos / (size + 1)) - 1).toString();
}

/**
  * Converts a coordinate number to a column letter on the grid
  */
export function toColAddr(colNum) {
  return colNum > -1
    ? colNum < 100 
      ? (colNum > 25 ? String.fromCharCode(Math.floor(colNum / 26) + 64) : '')
        + String.fromCharCode((colNum % 26) + 65)
      : 'CV'
    : 'A';
}

/**
  * Converts a coordinate number to a row number on the grid
  */
export function toRowAddr(rowNum) {
  if (!isNaN(Number(rowNum))) {
    let rowInt = Math.floor(rowNum);
    if (rowInt > 0) {
      return rowInt < 100 ? (rowInt + 1).toString() : '100';
    }
    return '1';
  }
}

/**
  * Tests for a valid address
  */
export function isAddress(address) {
  return !!address
    && address.toString().length > 1
    && /^([A-Z]+)([0-9]+)$/.test(address.toString().toUpperCase());
}

/**
  * Tests for valid coordinates
  */
export function isCoordinates(coordArr) {
  return Array.isArray(coordArr) && coordArr.length > 1 && !isNaN(coordArr[0]) && !isNaN(coordArr[1]);
}

/**
  * Converts addresses in the form 'A23' or 'AZ7' to arrays of coordinates, e.g. [1, 23] or [52, 7]
  */
export function toCoords(address) {
  return isAddress(address)
    ? Array.of(toColNum(address), toRowNum(address))
    : [0, 0];
}

/**
  * Converts a coordinate array e.g. [3, 31], to an alphanumeric address, e.g. 'C31'
  */
export function toAddress(coordArr) {
  return isCoordinates(coordArr)
    ? (toColAddr(coordArr[0]) + toRowAddr(coordArr[1])).toString()
    : 'A1';
}

