'use strict';

/**
  * Test a coordinate array to make sure it exists and is an array and has a length
  * of at least 2
  */
function testArray(arr) {
  return arr && Array.isArray(arr) && arr.length > 1
}

/**
  * Create a 3-dimensional storage array (columns x rows x fomulae | formatting)
  */
export const createStorageArr = (columns, rows) => Array
  .from(Array(columns), () => Array.from(Array(rows), () => new Array(2)));

/**
  * Get a formula from the storage at a particular address
  */
export const getFormula = (storageArr, cellCoordinatesArr) => {
  if (testArray(cellCoordinatesArr)) {
    const col = cellCoordinatesArr[0];
    const row = cellCoordinatesArr[1];
    return storageArr[col][row][0];
  }
  return ''
}

/**
  * Get a format string from the storage at a particular address
  */
export const getStyling = (storageArr, cellCoordinatesArr) => {
  if (testArray(cellCoordinatesArr)) {
    const col = cellCoordinatesArr[0];
    const row = cellCoordinatesArr[1];
    return storageArr[col][row][1];
  }
  return '';
}

/**
  * Set a formula for the storage at a particular address
  */
export const saveFormula = (storageArr, cellCoordinatesArr, formula) => {
  if (testArray(cellCoordinatesArr) && storageArr) {
    const col = cellCoordinatesArr[0];
    const row = cellCoordinatesArr[1];
    storageArr[col][row][0] = formula;
  }
  return formula;
}

/**
  * Set a format string for the storage at a particular address
  */
export const saveStyling = (storageArr, cellCoordinatesArr, styling) => {
  if (testArray(cellCoordinatesArr) && storageArr) {
    const col = cellCoordinatesArr[0];
    const row = cellCoordinatesArr[1];
    storageArr[col][row][1] = styling;
  }
  return styling;
}
