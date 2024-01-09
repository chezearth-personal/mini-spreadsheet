'use strict';

import { parseFormula } from "../functions/calculator.js";

/**
  * Test a coordinate array to make sure it exists and is an array and has a length
  * of at least 2
  */
function testArray(arr) {
  return arr && Array.isArray(arr) && arr.length > 1
}

/**
  * Set an element's styling according to a formatting string
  */
function setStyling(styling, elem) {
  if (elem) {
    if (styling && /[Bb]/.test(styling)) {
      elem.style.fontWeight = 'bold';
    } else {
      elem.style.fontWeight = 'normal';
    }
    if (styling && /[Ii]/.test(styling)) {
      elem.style.fontStyle = 'italic';
    } else {
      elem.style.fontStyle = 'normal';
    }
    if (styling && /[Uu]/.test(styling)) {
      elem.style.textDecorationLine = 'underline';
    } else {
      elem.style.textDecorationLine = 'none';
    }
  }
}

/**
  * Refresh the entire sheet's formulae
  */
export const refreshSheetFormula = (storageArr, doc) => {
  try {
    if (storageArr && Array.isArray(storageArr) && doc) {
      storageArr.forEach((colArr, i) => {
        if (colArr && Array.isArray(colArr)) {
          colArr.forEach((cell, j) => {
            if (cell[0]) {
              const cellSheet = doc.getElementById(Array.of(i,j).join('-'));
              cellSheet.value = '';
              cellSheet.value = parseFormula(cell[0], doc);
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
  * Refresh the entire sheet's formatting
  */
export const refreshSheetStyling = (storageArr, doc) => {
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
    return 0;
  }
}

/**
  * Create a 3-dimensional storage array (columns x rows x fomulae | formatting)
  */
export const createStorage = (size) => Array
  .from(Array(size), () => Array.from(Array(size), () => new Array(2)));

/**
  * Get a formula from the storage at a particular address
  */
export const getFormula = (storageArr, coordsArr) => {
  if (testArray(coordsArr)) {
    const col = coordsArr[0];
    const row = coordsArr[1];
    return storageArr[col][row][0];
  }
  return ''
}

/**
  * Get a format string from the storage at a particular address
  */
export const getStyling = (storageArr, coordsArr) => {
  if (testArray(coordsArr)) {
    const col = coordsArr[0];
    const row = coordsArr[1];
    return storageArr[col][row][1];
  }
  return '';
}

/**
  * Set a formula for the storage at a particular address
  */
export const saveFormula = (storageArr, coordsArr, formula) => {
  if (testArray(coordsArr) && storageArr) {
    const col = coordsArr[0];
    const row = coordsArr[1];
    storageArr[col][row][0] = formula;
  }
  return formula;
}

/**
  * Set a format string for the storage at a particular address
  */
export const saveStyling = (storageArr, coordsArr, styling) => {
  if (testArray(coordsArr) && storageArr) {
    const col = coordsArr[0];
    const row = coordsArr[1];
    storageArr[col][row][1] = styling;
  }
  return styling;
}
