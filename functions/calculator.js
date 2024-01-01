'use strict';

import { toCoords } from './addressConverter';

const calcFormula = (formula) => Function(`'use strict'; return (${formula.toString()})`)();

const parseRefs = (formula) => {
  const adjFormula = formula.replaceAll(/[a-zA-Z]{1,2}[0-9]{1,3}/g, (match) => {
    const elem = document.getElementById(toCoords(match).join('-'));
    return elem ? !elem.value ? 0 : elem.value : '#REF!';
  });
  console.log("Adjusted formula =", adjFormula);
  return adjFormula;
}

export const parseFormula = (formula) => {
  return (formula || '').toString().substring(0, 1) === "="
  ? calcFormula(parseRefs(formula.toString().substring(1)))
  : (formula || '' || formula === 0 ? formula : '').toString();
}
