'use strict';

import { parseFormula } from "../functions/calculator";

function testArray(arr) {
  return Array.isArray(arr) && arr.length > 1
}

/**
  * Refresh the entire sheet
  */
export const refreshSheet = (storageArr, doc) => {
  try {
    if (storageArr && Array.isArray(storageArr) && doc) {
      storageArr.forEach((colArr, i) => {
        if (colArr && Array.isArray(colArr)) {
          colArr.forEach((cellFormula, j) => {
            if (cellFormula) {
              const cellSheet = doc.getElementById(Array.of(i,j).join('-'));
              cellSheet.value = parseFormula(cellFormula, doc);
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

export const createStorage = (size) => Array
  .from(Array(size), () => Array.from(new Array(size)));

export const getFormula = (storageArr, address) => {
  if (testArray(address)) {
    const col = address[0];
    const row = address[1];
    return storageArr[col][row];
  }
  return ''
}

export const saveFormula = (storage, address, formula) => {
  if (address && Array.isArray(address) && address.length > 1 && storage) {
    const col = address[0];
    const row = address[1];
    storage[col][row] = formula;
  }
  return formula;
}
