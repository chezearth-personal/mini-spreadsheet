'use strict';

import { toCellCoordinates } from './addressConverter.js';
import { builtInFunctions as builtInFunctionsArr } from '../config.js';

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

const sum = (paramsArr, doc, storageArr) => {
  return Array.isArray(paramsArr) && paramsArr
    .reduce((r, param) => {
      const cellValue = Array.isArray(param) ? doc.getElementById(param.join('-')).value : param;
      const cellFormula = Array.isArray(param) ? storageArr[param[0]][param[1]][0]: param;
      return !cellValue || isNaN(Number(cellValue)) || cellFormula.substring(0, 1) === `'` ? r : r + Number(cellValue);
    }, 0);
}

/**
  * Creates a RegExp based on the function's name (e.g. SUM, COUNT, etc.)
  */
const functionRegExp = (funcName) => new RegExp(`${funcName.toUpperCase()}\\([^\\(\\)]+\\)`, 'g');

/**
  * Determine if at least one ocurrance of the formula is present
  */
const containsFunction = (formula) => builtInFunctionsArr
  .reduce((result, func) => result || functionRegExp(func.name).test(formula.toUpperCase()), false);

/**
  * Determines if an experssion is a range, e.g. A2:C4
  */
const isParamsRange = (parameters) => /^[A-Z]{1,2}[0-9]{1,3}\:[A-Z]{1,2}[0-9]{1,3}/
  .test(parameters.toUpperCase());

/**
  * Based on the function name, executes the required calculation function
  */
const functionHandler = (paramsArr, func, doc, storageArr) => {
  if (Array.isArray(paramsArr)) {
    if (func.name === 'AVERAGE') {
      return average(paramsArr, doc);
    } else if (func.name === 'COUNT') {
      return count(paramsArr, doc);
    } else {
      return sum(paramsArr, doc, storageArr);
    }
  }
  return '!#REF';
}

/**
  * Converts function parameters representing an address range into a sequence of coordinates
  */
const paramsRangeHandler = (paramsRange) => {
  const rangeArr = paramsRange.match(/[A-Z]{1,2}[0-9]{1,3}/g);
  const eArr = rangeArr.map(addr => toCellCoordinates(addr));
  let cellsArr = [];
  for (let i = Math.min(eArr[0][1], eArr[1][1]); i <= Math.max(eArr[0][1], eArr[1][1]); i++) {
    for (let j = Math.min(eArr[0][0], eArr[1][0]); j <= Math.max(eArr[0][0], eArr[1][0]); j++) {
      cellsArr = cellsArr.concat(Array.of([j, i]));
    }
  }
  return cellsArr;
}

/**
  * Converts a comma-separated list of addresses or numbers into a list of array
  * coordinates or numbers
  */
const paramsListHandler = (paramsList) => {
  return paramsList.split(',')
    .map(param => /[A-Z]{1,2}[0-9]{1,3}/.test(param.toUpperCase().trim())
      ? toCellCoordinates(param.trim())
      : param.trim()
    );
}

/**
  * Tests to see if the parameters are a comma-separated list or a range (e.g. A2:B15)
  * and calls the appropriate processing function to obtain an array of rwo-column
  * coordinates
  */
const functionParametersHandler = (formula, func, doc, storageArr) => {
  const parameters = formula.match(/\(.+\)/g)[0].slice(1, -1);
  const resolvedParameters = containsFunction(parameters)
    ? parseBuiltInFunctions(parameters, doc)
    : parameters;
  const paramsArr = isParamsRange(resolvedParameters) ? paramsRangeHandler(resolvedParameters) : paramsListHandler(resolvedParameters);
  return functionHandler(paramsArr, func, doc, storageArr);
}

/**
  * Loops through the list of built-in functions in config.js and tests the formula for
  * each listed function. If the function is found, then it calls the function's parameters
  * handler
  */
const parseBuiltInFunctions = (formula, doc, storageArr) => {
  return containsFunction(formula)
    ? builtInFunctionsArr.reduce((result, func) => {
        const newFormula = result.toUpperCase().replaceAll(functionRegExp(func.name), (match) => {
          const range = functionParametersHandler(match, func, doc, storageArr);
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
const parseReferences = (formula, doc) => {
  return !formula
    ? 0
    : formula.toUpperCase().replaceAll(/[A-Z]{1,2}[0-9]{1,3}/g, (match) => {
        const elem = doc.getElementById(toCellCoordinates(match).join('-'));
        return elem ? !elem.value ? 0 : elem.value : '#REF!'
      });
}

/**
  * The main function for calling the calculator that parses the formula expressions
  * into functions or arithmetic expressions.
  * Parameters:
  *   formula: string
  *   doc: DOM document object
  */
export const parseFormula = (formula, doc, storageArr) => {
  /** Treat anything after `'` as plain text */
  if (formula.substring(0, 1) === `'`) {
    return formula.substring(1);
  }
  const functionResult = parseBuiltInFunctions(formula, doc, storageArr);
  if (!functionResult && functionResult !== 0) {
    return (formula || '').toString().substring(0, 1) === '='
      ? /[A-Za-z]$|[A-Za-z][^0-9]/g.test(formula.toString())
        ? formula.toString().substring(1)
        : calcFormula(parseReferences(formula.toString().substring(1), doc))
      : (formula || '' || formula === 0 ? formula : '').toString();
  }
  const newFunctionResult = parseFormula(functionResult, doc, storageArr);
  return newFunctionResult.toString().substring(0, 1) === '='
    ? newFunctionResult.toString().substring(1)
    : newFunctionResult.toString();
}
