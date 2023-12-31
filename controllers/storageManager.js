import { parseFormula } from "../functions/calculator";

export const createStorage = (size) => Array
  .from(Array(size), () => Array.from(Array(size), () => new Array(2)));

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
