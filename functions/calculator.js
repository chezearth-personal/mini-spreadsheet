'use strict';

import { toCellCoordinates } from './addressConverter.js';

const coalesceFormula = (formula) => (formula || '').toString();

/**
  * Determine if the cell expression is a formula, i.e. starts with '='
  */
const testForFormula = (formula) => coalesceFormula(formula).toString().substring(0, 1) === '='
      || coalesceFormula(formula).toString().substring(0, 1) === '+';

/**
  * Determine if there are cell references (addresses) in the formula
  */
const testForReferences = (formula) => /[A-Za-z]$|[A-Za-z][^0-9]/g.test(coalesceFormula(formula).toString());

/**
  * Determine if at least one ocurrance of the formula is present
  */
const testForBuiltInFunction = (formula, builtInFunctionsArr) => builtInFunctionsArr
  .reduce((result, func) => result || functionRegExp(func.name).test(formula.toUpperCase()), false);

/**
  * Main basic calculator; converts a string into a calculation
  */
const calcFormula = (formula) => Function(`'use strict'; return (${formula.toString()})`)();

/**
  * Array average function calculator
  */
const average = (paramsArr, data) => {
  return Array.isArray(paramsArr) && count(paramsArr, doc) !== 0
    ? sum(paramsArr, data) / count(paramsArr, data)
    : '#DIV0!';
}

/**
  * Array count function calculator
  */
const count = (paramsArr, data) => {
  return Array.isArray(paramsArr) && paramsArr
    .filter(param => {
      const cellValue = Array.isArray(param) 
        ? parseFormula(data.storageArr[param[0]][param[1]][0], data)
        : param
      return !!cellValue || cellValue === 0;
    })
    .length;
}

/**
  * Array sum function calculator
  */
const sum = (paramsArr, data) => {
  // console.log('sum(): paramsArr =', paramsArr);
  return Array.isArray(paramsArr) && paramsArr
    .reduce((r, param) => {
      // console.log('sum(): param =', param, '; result =', r);
      const cellFormula = Array.isArray(param) ? data.storageArr[param[0]][param[1]][0] : param;
      // console.log('sum(): cellFormula =', cellFormula);
      const cellValue = !cellFormula && cellFormula !== 0 ? '' : parseFormula(cellFormula, data);
      // console.log('sum(): cellValue =', cellValue);
      return !cellValue || isNaN(Number(cellValue)) || cellFormula.substring(0, 1) === `'` ? r : r + Number(cellValue);
    }, 0);
}

/**
  * Creates a RegExp based on the function's name (e.g. SUM, COUNT, etc.)
  */
const functionRegExp = (funcName) => new RegExp(`${funcName.toUpperCase()}\\([^\\(\\)]+\\)`, 'g');

/**
  * Determines if an experssion is a range, e.g. A2:C4
  */
const isParamsRange = (parameters) => /^[A-Z]{1,2}[0-9]{1,3}\:[A-Z]{1,2}[0-9]{1,3}/
  .test(parameters.toUpperCase());

/**
  * Based on the function name, executes the required calculation function
  */
const functionHandler = (paramsArr, func, data) => {
  if (Array.isArray(paramsArr)) {
    if (func.name === 'AVERAGE') {
      return average(paramsArr, data);
    } else if (func.name === 'COUNT') {
      return count(paramsArr, data);
    } else {
      return sum(paramsArr, data);
    }
  }
  return '#REF!';
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
const functionParametersHandler = (formula, func, data) => {
  const parameters = formula.match(/\(.+\)/g)[0].slice(1, -1);
  const resolvedParameters = testForBuiltInFunction(parameters, data.builtInFunctions)
    ? parseBuiltInFunctions(parameters, data)
    : parameters;
  const paramsArr = isParamsRange(resolvedParameters) ? paramsRangeHandler(resolvedParameters) : paramsListHandler(resolvedParameters);
  return functionHandler(paramsArr, func, data);
}

/**
  * Loops through the list of built-in functions in config.js and tests the formula for
  * each listed function. If the function is found, then it calls the function's parameters
  * handler
  */
const parseBuiltInFunctions = (formula, data) => {
  // console.log('parseBuiltInFunctions(): formula =', formula);
  return testForBuiltInFunction(formula, data.builtInFunctions)
    ? data.builtInFunctions.reduce((result, func) => {
        const newFormula = result.toUpperCase().replaceAll(functionRegExp(func.name), (match) => {
          const range = functionParametersHandler(match, func, data);
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
const parseReferences = (formula, data) => {
  // console.log('parseReferences(): data =', data);
  const res = !formula
    ? 0
    : formula.toUpperCase().replaceAll(/[A-Z]{1,2}[0-9]{1,3}/g, (match) => {
        // console.log('parseReferences(): formula=', formula, '; match =', match, ';', toCellCoordinates(match));
        const cellCoordinates = toCellCoordinates(match);
        const elem = cellCoordinates && Array.isArray(cellCoordinates) 
          ? parseFormula(
              data.storageArr[cellCoordinates[0]][cellCoordinates[1]][0],
              data
            )
          : '#REF!'
        // console.log('parseReferences(): elem =', elem);
        // const elem = doc.getElementById(toCellCoordinates(match).join('-'));
        return elem //? !elem.value ? 0 : elem.value : '#REF!'
      });
  // console.log('parseReferences(): res =', res);
  return res;
}


/**
  * Remove the '=', handle negative signs, handle decimal points, handle zeros
  */
function formattingFunctions(formula) {
  return {
    dropLeadingChars: function(ch) {
      formula = coalesceFormula(formula).substring(0, 1) === ch.toString().substring(0, 1)
        ? formattingFunctions(coalesceFormula(formula).substring(1)).dropLeadingChars(ch).result()
        : coalesceFormula(formula).toString();
      return this;
    },
    getLeadingNegativeSign: function() {
      const getLeadingNegativeSignsArr = coalesceFormula(formula).toString().match(/^[\-]+/g);
      formula = Array.isArray(getLeadingNegativeSignsArr)
        && getLeadingNegativeSignsArr.length 
        && getLeadingNegativeSignsArr[0].length % 2 !== 0
          ? '-' 
          : '';
      return this;
    },
    coverLeadingDecimalPoint: function() {
      const dropLeadingNegativeSignsArr = coalesceFormula(formula).toString().match(/[^\-].*/g);
      formula = Array.isArray(dropLeadingNegativeSignsArr) && dropLeadingNegativeSignsArr.length
        ? dropLeadingNegativeSignsArr[0].substring(0, 1) === '.'
          ? '0' + dropLeadingNegativeSignsArr[0]
          : dropLeadingNegativeSignsArr[0]
        : '';
      // console.log('formattingFunctions(): coverLeadingDecimalPoint() =', formula);
      return this;
    },
    coalesceToZero: function() {
      formula = isNaN(Number(coalesceFormula(formula)))
        ? coalesceFormula(formula)
        : Number(coalesceFormula(formula)) === 0 ? '0' : coalesceFormula(formula);
      return this;
    },
    result: function() {
      // console.log('formattingFunctions(): result =', formula);
      return formula;
    }
  }
}

const getSign = (formula) => formattingFunctions(formula)
  .dropLeadingChars('=')
  .getLeadingNegativeSign()
  .result();

const getNumerical = (formula) => formattingFunctions(formula)
  .dropLeadingChars('=')
  .coverLeadingDecimalPoint()
  .result();

const formatCalcResult = (formula) => {
  return formattingFunctions(getSign(formula) + getNumerical(formula))
    .coalesceToZero()
    .result();
}

/**
  * The main function for calling the calculator that parses the spreadsheet
  * formulasminto functions or arithmetic expressions.
  * Parameters:
  *   formula: string
  *   doc: DOM document object
  *   data: Object that combines configs and the formula array
  */
export const parseFormula = (formula, data) => {
  /** Treat anything after `'` as plain text */
  if (coalesceFormula(formula).toString().substring(0, 1) === `'`) {
    return coalesceFormula(formula).toString().substring(1);
  }
  /** Process the formula as a number, a formula or default back to text */
  const functionResult = parseBuiltInFunctions(coalesceFormula(formula), data);
  // console.log('functionResult =', functionResult);
  if (!functionResult && functionResult !== 0) {
    return testForFormula(formula)
      ? testForReferences(formula)
        ? formattingFunctions(formula).dropLeadingChars('=').result().toString()
        : calcFormula(parseReferences(formatCalcResult(formula), data))
        // : calcFormula(parseReferences(formattingFunctions(formula).dropLeadingChars('=').result(), doc))
      : (!formula && formula !== 0 ? '' : formatCalcResult(formula));
  }
  return formatCalcResult(parseFormula(functionResult, data));
}
