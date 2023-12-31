
export const parseFormula = (formula) => formula.toString().substring(0, 1) === "="
  ? Function(`'use strict'; return (${formula.toString().substring(1)})`)()
  : formula.toString();
