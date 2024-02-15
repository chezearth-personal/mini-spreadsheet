'use strict';

import { toCellCoordinates } from './addressConverter.js';

/**
  * Coalesce the formula to an empty string if it is undefined or null
  */
const coalesceExpression = (expression) => (expression || '').toString();

/**
  * Creates a RegExp based on the function's name (e.g. SUM, COUNT, etc.)
  */
const functionRegExp = (funcName) => new RegExp(`${funcName.toUpperCase()}\\([^\\(\\)]*\\)`, 'g');

/**
  * Determine if the expression is declared text (begins with a single quote)
  */
const testForText = (expression) => expression.substring(0, 1) === `'`;

/**
  * Determine if the cell expression is a formula, i.e. starts with '='
  */
const testForFormula = (expression) => expression.substring(0, 1) === '='
  || expression.substring(0, 1) === '+'
  || expression.substring(0, 1) === '-';

/**
  * Determine if there are cell references (addresses) in the formula
  */
const testForReferences = (formula) => /[A-Za-z]$|[A-Za-z][^0-9]/g.test(formula);

/**
  * Determine if at least one ocurrance of the formula is present
  */
const testForBuiltInFunction = (formula, builtInFunctionsArr) => {
  const formulaUpper = !formula ? '' : formula.toUpperCase();
  return builtInFunctionsArr
  .reduce((result, func) => result || functionRegExp(func.name).test(formulaUpper), false);
}

/**
  * Determine if the expression is a number
  */
const isNumber = (expression) => !isNaN(Number(expression));

/**
  * Main basic calculator; converts a string into a calculation
  */
// const calcFormula = (formula) => {
  // const mod = formula.toString().replaceAll(/-{2,}/g, (match) => match.length % 2 === 0 ? '+' : '-');
  // return Function(`'use strict'; return (${mod})`)().toString();
// }

/**
  * Parses the cell address references into array coordinates and looks up the 
  * on the grid input
  */
// const parseReferences = (formula, data) => {
  // console.log('parseReferences(): data =', data);
  // const res = !formula
    // ? 0
    // : formula.toUpperCase().replaceAll(/[A-Z]{1,2}[0-9]{1,3}/g, (match) => {
        // console.log('parseReferences(): formula=', formula, '; match =', match, ';', toCellCoordinates(match));
        // const cellCoordinates = toCellCoordinates(match);
        // const elem = cellCoordinates && Array.isArray(cellCoordinates) 
          // ? parseFormula(
              // data.storageArr[cellCoordinates[0]][cellCoordinates[1]][0],
              // data
            // )
          // : '#REF!'
        // console.log('parseReferences(): elem =', elem);
        // const elem = doc.getElementById(toCellCoordinates(match).join('-'));
        // return elem //? !elem.value ? 0 : elem.value : '#REF!'
      // });
  // console.log('parseReferences(): res =', res);
  // return res;
// }

/**
  * Loops through the list of built-in functions in config.js and tests the formula for
  * each listed function. If the function is found, then it calls the function's parameters
  * handler
  */
const parseBuiltInFunctions = (formula, data) => {
  return data.builtInFunctions.reduce((result, func) => result
    .toUpperCase()
    .replaceAll(
      functionRegExp(func.name),
      (match) => calculatorMethods(match, data)
        .getParamsStr(data)
        .getParamsRangeArr()
        .getParamsListArr()
        .sum(func, data)
        .count(func, data)
        .average(func, data)
        .result()
    ), formula)
}

function calculatorMethods(formula) {
  let paramsStr = '';
  let paramsArr = [];
  /** Determines if an experssion is a range, e.g. A2:C4 */
  const isParamsRange = (parameters) => /^[A-Z]{1,2}[0-9]{1,3}\:[A-Z]{1,2}[0-9]{1,3}/
    .test(parameters.toUpperCase());
  /** Chained methods for processing Formulae and their parameters */
  return {
    /** Format the formula as much as possible first */
    formatCalcResult: function() {
      // console.log('1. formatCalcResult(): formula =', formula);
      formula = formatCalcResult(formula);
      // console.log('2. formatCalcResult(): formula =', formula);
      return this;
    },
    /** Parse all cell references to values */
    parseReferences: function(data) {
      // console.log('1. parseReferences(): formula =', formula);
      formula = !formula
        ? 0
        : formula.toUpperCase().replaceAll(/[A-Z]{1,2}[0-9]{1,3}/g, (match) => {
            const cellCoordinates = toCellCoordinates(match);
            const elem = cellCoordinates && Array.isArray(cellCoordinates) 
              ? parseFormula(
                  data.storageArr[cellCoordinates[0]][cellCoordinates[1]][0],
                  data
                )
              : '#REF!'
            return elem
          });
      // console.log('2. parseReferences(): formula =', formula);
      return this;
    },
    /** Any multiple consecutive negative signs to be converted to a single signs */
    combineNegativeSigns: function(showPlus) {
      // console.log('1. combineMultipleNegativeSigns(): formula =', formula);
      formula = formatMethods(formula).combineNegativeSigns(showPlus).result();
      // console.log('2. combineMultipleNegativeSigns(): formula =', formula);
      return this;
    },
    /** Evaluate the formula */
    calculate: function() {
      // console.log('1. calcFormula(): formula =', formula);
      formula = Function(`'use strict'; return (${formula.toString()})`)()
        .toString();
      // console.log('2. calcFormula(): formula =', formula);
      return this;
    },
    /** Gets the parameters list and returns it as a string, e.g. A2:B15 or A2, B3, C4. */
    getParamsStr: function (data) {
      const paramsMatchArr = formula.match(/\(.+\)/g);
      // console.log('getParamsStr(): paramsMatchArr =', paramsMatchArr);
      const paramsMatchStr = paramsMatchArr && paramsMatchArr[0].slice(1, -1);
      // console.log('getParamsStr(): paramsMatchStr =', paramsMatchStr);
      paramsStr = testForBuiltInFunction(paramsMatchStr, data.builtInFunctions)
        ? parseBuiltInFunctions(paramsMatchStr, data)
        : paramsMatchStr;
      // console.log('getParamsStr(): paramsStr =', paramsStr);
      return this;
    },
    /** Converts function parameters representing an address range into a sequence of coordinates. */
    getParamsRangeArr: function() {
      if (isParamsRange(paramsStr)) {
        const rangeArr = paramsStr.match(/[A-Z]{1,2}[0-9]{1,3}/g);
        const eArr = rangeArr.map(addr => toCellCoordinates(addr));
        let cellsArr = [];
        for (let i = Math.min(eArr[0][1], eArr[1][1]); i <= Math.max(eArr[0][1], eArr[1][1]); i++) {
          for (let j = Math.min(eArr[0][0], eArr[1][0]); j <= Math.max(eArr[0][0], eArr[1][0]); j++) {
            cellsArr = cellsArr.concat(Array.of([j, i]));
          }
        }
        paramsArr = cellsArr;
      }
      return this;
    },
    /** Converts a comma-separated list of addresses or numbers into a list of array
    /** coordinates or numbers */
    getParamsListArr: function() {
      if (!isParamsRange(paramsStr)) {
        paramsArr = paramsStr
          .split(',')
          .map(param => /[A-Z]{1,2}[0-9]{1,3}/.test(param.toUpperCase().trim())
            ? toCellCoordinates(param.trim())
            : !param ? '' : param.trim()
          );
      }
      return this;
    },
    /** Array sum function calculator */
    sum: function(func, data) {
      if (func.name === 'SUM' && Array.isArray(paramsArr) && paramsArr.length) { 
        formula = paramsArr
          .reduce((r, param) => {
            const cellFormula = Array.isArray(param) ? data.storageArr[param[0]][param[1]][0] : param;
            const cellValue = !cellFormula && cellFormula !== 0 ? '' : parseFormula(cellFormula, data);
            return !cellValue || !isNumber(cellValue) || cellFormula.substring(0, 1) === `'` ? r : r + Number(cellValue);
          }, 0);
      }
      return this;
    },
    /** Array count function calculator */
    count: function(func, data) {
      if (func.name === 'COUNT' && Array.isArray(paramsArr) && paramsArr.length) {
        formula = paramsArr
          .filter(param => {
            const cellValue = Array.isArray(param) 
              ? parseFormula(data.storageArr[param[0]][param[1]][0], data)
              : param
            return !!cellValue || cellValue === 0;
          })
          .length;
      }
      return this;
    },
    /** Array average function calculator */
    average: function(func, data) {
      if (func.name === 'AVERAGE' && Array.isArray(paramsArr) && paramsArr.length) {
        formula = count(paramsArr, data) ? sum(paramsArr, data) / count(paramsArr, data) : '#DIV0!';
      }
      return this;
    },
    result: function() {
      return formula;
    }
  };
}


/**
  * Remove the '=', handle negative signs, handle decimal points, handle zeros
  */
function formatMethods(formula) {
  return {
    dropLeadingChars: function(ch) {
      formula = coalesceExpression(formula).substring(0, 1) === ch.toString().substring(0, 1)
        ? formatMethods(coalesceExpression(formula).substring(1)).dropLeadingChars(ch).result()
        : coalesceExpression(formula).toString();
      return this;
    },
    combineNegativeSigns: function(showPlus) {
      // console.log('combineNegativeSigns(): formula =', formula, '; showPlus =', showPlus);
      formula = formula.toString().replaceAll(/-{2,}/g, (match) => match.length % 2 === 0
        ? showPlus ? '+' : '' 
        : '-'
      );
      // console.log('combineNegativeSigns(): formula =', formula);
      // const getLeadingNegativeSignsArr = coalesceExpression(formula).toString().match(/^[\-]+/g);
      // formula = Array.isArray(getLeadingNegativeSignsArr)
        // && getLeadingNegativeSignsArr.length 
        // && getLeadingNegativeSignsArr[0].length % 2 !== 0
          // ? '-' 
          // : showPlus;
      return this;
    },
    getLeadingNegativeSigns: function() {
      formula = formula.substring(0, 1) === '-' ? '-' : '';
      return this;
    },
    coverLeadingDecimalPoint: function() {
      const dropLeadingNegativeSignsArr = coalesceExpression(formula).toString().match(/[^\-].*/g);
      formula = Array.isArray(dropLeadingNegativeSignsArr) && dropLeadingNegativeSignsArr.length
        ? dropLeadingNegativeSignsArr[0].substring(0, 1) === '.'
          ? '0' + dropLeadingNegativeSignsArr[0]
          : dropLeadingNegativeSignsArr[0]
        : '';
      return this;
    },
    coalesceToZero: function() {
      formula = !isNumber(coalesceExpression(formula))
        ? coalesceExpression(formula)
        : Number(coalesceExpression(formula)) === 0 ? '0' : coalesceExpression(formula);
      return this;
    },
    result: function() {
      return formula;
    }
  };
}

const getSign = (formula) => formatMethods(formula)
  .dropLeadingChars('=')
  .combineNegativeSigns(false)
  .getLeadingNegativeSigns()
  .result();

const getNumerical = (formula) => formatMethods(formula)
  .dropLeadingChars('=')
  .coverLeadingDecimalPoint()
  .result();

const formatCalcResult = (formula) => {
  // console.log('formatCalcResult(): formula =', formula);
  return formatMethods(getSign(formula) + getNumerical(formula))
    .coalesceToZero()
    .result()
    .toString();
}

const parseFormula = (formula, data) => {
  /** Test to see if the formula contains a built in function; if it does, */
  /** process the formula, otherwise return empty*/
  const functionResult = testForBuiltInFunction(formula, data.builtInFunctions)
    && parseBuiltInFunctions(formula.toUpperCase(), data);
  // console.log('functionResult =', functionResult);
  if (!functionResult && functionResult !== 0) {
    return testForReferences(formula)
      ? formatMethods(formula).dropLeadingChars('=').result().toString()
      : calculatorMethods(formula).formatCalcResult().parseReferences(data).combineNegativeSigns(true).calculate().result();
      // : calcFormula(parseReferences(formatCalcResult(formula), data))
  }
  return formatCalcResult(parseFormula(functionResult, data));
}

/**
  * The main function for calling the calculator that parses the spreadsheet
  * expressions into text expressions of formula functions, defined as beginning 
  * with '=', '+', or '-'. It then calls the appropriate function to parse the
  * Parameters:
  *   expression: string
  *   data: Object that combines configs and the formula array
  */
export const parseExpression = (expression, data) => {
  /** Coalesce the expression to a string or empty string */
  const coalesced = coalesceExpression(expression);
  /** First check if the expression is just text: treat anything after `'` as plain text */
  if (testForText(coalesced)) return coalesced.substring(1);
  /** Check whether to expression is a not a formula */
  if (!testForFormula(coalesced)) return isNumber(coalesced)
    ? formatCalcResult(coalesced)
    : coalesced ;
  /** Determine whether the expression contains a Built-in Function or not */
  return parseFormula(coalesced, data);
}
