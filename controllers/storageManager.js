import { parseFormula } from "../functions/calculator";

function testArray(arr) {
  return Array.isArray(arr) && arr.length > 1
}

export const createStorage = (size) => Array
  .from(Array(size), () => Array.from(Array(size), () => new Array(2)));

export const getFormula = (storage, address) => {
  if (testArray(address)) {
    const col = address[0];
    const row = address[1];
    return storage[col][row][0];
  }
  return ''
}

export const saveFormula = (storage, address, formula) => {
  if (Array.isArray(address) && address.length > 1) {
    const col = address[0];
    const row = address[1];
    storage[col][row][0] = formula;
    const result = parseFormula(formula);
    storage[col][row][1] = result;
    return result;
  }
  return formula;
}
