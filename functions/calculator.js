'use strict';

import { toCoords } from './addressConverter.js';
import { funcsList } from '../config.json';

const calcFormula = (formula) => Function(`'use strict'; return (${formula.toString()})`)();

const average = (paramsArr, doc) => {
  return Array.isArray(paramsArr) && count(paramsArr, doc) !== 0
    ? sum(paramsArr, doc) / count(paramsArr, doc)
    : '!#DIV0';
}

const count = (paramsArr, doc) => {
  return Array.isArray(paramsArr) && paramsArr
    .filter(param => !!doc.getElementById(param.join('-')).value || doc.getElementById(param.join('-')).value === 0)
    .length;
}

const sum = (paramsArr, doc) => {
  return Array.isArray(paramsArr) && paramsArr
    .reduce((r, param) => {
      const cellValue = doc.getElementById(param.join('-')).value;
      return r + (isNaN(Number(cellValue)) ? cellValue : Number(cellValue));
    }, 0);
}

const rangeHandler = (paramsRange) => {
  const rangeArr = paramsRange.match(/[A-Z]{1,2}[0-9]{1,3}/g);
  const eArr = rangeArr.map(addr => toCoords(addr));
  let cellsArr = [];
  for (let i = Math.min(eArr[0][1], eArr[1][1]); i <= Math.max(eArr[0][1], eArr[1][1]); i++) {
    for (let j = Math.min(eArr[0][0], eArr[1][0]); j <= Math.max(eArr[0][0], eArr[1][0]); j++) {
      cellsArr = cellsArr.concat(Array.of([j, i]));
    }
  }
  return cellsArr;
}

const listHandler = (paramsList) => {
  return paramsList.split(',')
    .map(param => toCoords(param.trim()));
}

/**
  * Based on the function name, executes the required calculation function
  */
const funcHandler = (paramsArr, func, doc) => {
  if (Array.isArray(paramsArr)) {
    if (func.name === 'AVERAGE') {
      return average(paramsArr, doc);
    } else if (func.name === 'COUNT') {
      return count(paramsArr, doc);
    } else {
      return sum(paramsArr, doc);
    }
  }
  return '!#REF';
}

/**
  * Tests to see if the parameters are a comma-separated list or a range (e.g. A2:B15)
  * and calls the appropriate processing function to obtain an array of rwo-column
  * coordinates
  */
const parametersHandler = (formulaFunc, func, doc) => {
  const parameters = formulaFunc.match(/\(.+\)/g)[0].slice(1, -1);
  const isRange = /^[A-Z]{1,2}[0-9]{1,3}\:[A-Z]{1,2}[0-9]{1,3}/.test(parameters);
  const paramsArr = isRange ? rangeHandler(parameters) : listHandler(parameters)
  return funcHandler(paramsArr, func, doc);
}

/**
  * Creates a RegExp based on the formula's function name (e.g. SUM, COUNT, etc.)
  */
const funcRegexp = (f) => new RegExp(`${f.toUpperCase()}\(.+\)`, 'g');

/**
  * Loops through the list of functions in config.json and tests the formula for each
  * listed function. If the function is found, then it calls the function's parameters
  * handler
  */
const parseFuncs = (formula, doc) => {
  const isFormula = funcsList.reduce((r, func) => {
    return r || funcRegexp(func.name).test(formula.toUpperCase());
  }, false);
  return isFormula 
    ? funcsList.reduce((r, func) => {
        const newFormula = r.toUpperCase().replaceAll(funcRegexp(func.name), (match) => {
          const range = parametersHandler(match, func, doc);
          return range.toString();
        });
        return newFormula;
      }, formula)
    : '';
}

/**
  * Parses the cell address references into array coordinates and looks up the 
  * on the grid input
  */
const parseRefs = (formula, doc) => {
  return formula.toUpperCase().replaceAll(/[A-Z]{1,2}[0-9]{1,3}/g, (match) => {
    const elem = doc.getElementById(toCoords(match).join('-'));
    return elem ? !elem.value ? 0 : elem.value : '#REF!';
  });
}

/**
  * The main function for calling the calculator that parses the formula expressions
  * into functions or arithmetic expressions.
  * Parameters:
  *   formula: string
  *   doc: DOM document object
  */
export const parseFormula = (formula, doc) => {
  const func = parseFuncs(formula, doc);
  return !func && func !== 0
    ? (formula || '').toString().substring(0, 1) === "="
      ? /[A-Za-z]$|[A-Za-z][^0-9]/g.test(formula.toString())
        ? formula.toString().substring(1)
        : calcFormula(parseRefs(formula.toString().substring(1), doc))
      : (formula || '' || formula === 0 ? formula : '').toString()
    : func.substring(0, 1) === '=' ? func.toString().substring(1) : func.toString();
}
