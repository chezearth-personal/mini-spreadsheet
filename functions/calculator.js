'use strict';

import { toCellCoordinates } from './addressConverter.js';

/**
  * Main basic calculator; converts a string into a calculation
  */
const calcFormula = (formula) => Function(`'use strict'; return (${formula.toString()})`)();

/**
  * Array average function calculator
  */
const average = (paramsArr, doc) => {
  return Array.isArray(paramsArr) && count(paramsArr, doc) !== 0
    ? sum(paramsArr, doc) / count(paramsArr, doc)
    : '#DIV0!';
}

/**
  * Array count function calculator
  */
const count = (paramsArr, doc) => {
  return Array.isArray(paramsArr) && paramsArr
    .filter(param => !!doc.getElementById(param.join('-')).value || doc.getElementById(param.join('-')).value === 0)
    .length;
}

/**
  * Array sum function calculator
  */
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
const containsFunction = (builtInFunctionsArr, formula) => builtInFunctionsArr
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
const functionParametersHandler = (formula, func, doc, data) => {
  const parameters = formula.match(/\(.+\)/g)[0].slice(1, -1);
  const resolvedParameters = containsFunction(data.builtInFunctions, parameters)
    ? parseBuiltInFunctions(parameters, doc)
    : parameters;
  const paramsArr = isParamsRange(resolvedParameters) ? paramsRangeHandler(resolvedParameters) : paramsListHandler(resolvedParameters);
  return functionHandler(paramsArr, func, doc, data.storageArr);
}

/**
  * Loops through the list of built-in functions in config.js and tests the formula for
  * each listed function. If the function is found, then it calls the function's parameters
  * handler
  */
const parseBuiltInFunctions = (formula, doc, data) => {
  // console.log(data.builtInFunctions);
  return containsFunction(data.builtInFunctions, formula)
    ? data.builtInFunctions.reduce((result, func) => {
        // console.log('func =', func);
        const newFormula = result.toUpperCase().replaceAll(functionRegExp(func.name), (match) => {
          const range = functionParametersHandler(match, func, doc, data);
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
  * Remove the '=', handle negative signs, handle decimal points, handle zeros
  */

const formatCalcResult = (formula) => {
  Object.defineProperties(String.prototype, {
    dropLeadingChars: {
      value: function(character) {
        return this.toString().substring(0, 1) === character
          ? this.toString().substring(1).dropLeadingChars(character)
          : this.toString();
      }
    },
    getLeadingNegativeSigns: {
      value: function() {
        const getLeadingNegativeSignsArr = (formula) => formula.toString().match(/^[\-]+/g);
        return Array.isArray(getLeadingNegativeSignsArr(this)) 
          && getLeadingNegativeSignsArr(this).length 
          && getLeadingNegativeSignsArr(this)[0].length % 2 === 0
            ? '' 
            : '-';
      }
    },
    dropLeadingNegativeSigns: {
      value: function() {
        return this
      }
    },
    coverLeadingDecimalPoint: {
      value: function() {
        const dropLeadingNegativeSignsArr = this.toString().match(/[^\-][\.0-9]*/g);
        return Array.isArray(dropLeadingNegativeSignsArr) && dropLeadingNegativeSignsArr.length
          ? dropLeadingNegativeSignsArr[0].substring(0, 1) === '.'
            ? '0' + dropLeadingNegativeSignsArr[0]
            : dropLeadingNegativeSignsArr[0]
          : '';
      }
    },
    coalesceZero: {
      value: function() {
        return (Number(this))
          ? this 
          : Number(this) === 0 ? '0' : this;
      }
    }
  }); 
  return (formula.toString().dropLeadingChars('=').getLeadingNegativeSigns().getLeadingNegativeSigns()
    + formula.toString().dropLeadingChars('=').coverLeadingDecimalPoint()
  ).coalesceZero();
}

/**
  * The main function for calling the calculator th at parses the formula expressions
  * into functions or arithmetic expressions.
  * Parameters:
  *   formula: string
  *   doc: DOM document object
  */
export const parseFormula = (formula, doc, data) => {
  /** Treat anything after `'` as plain text */
  if (formula.substring(0, 1) === `'`) {
    return formula.substring(1);
  }
  /** Process the formula as a number, a formula or default back to text */
  const functionResult = parseBuiltInFunctions(formula, doc, data);
  if (!functionResult && functionResult !== 0) {
    const testForFormula = (formula || '').toString().substring(0, 1) === '='
      || (formula || '').toString().substring(0, 1) === '+';
    return testForFormula
      ? /[A-Za-z]$|[A-Za-z][^0-9]/g.test(formula.toString())
        ? formula.toString().substring(1)
        : calcFormula(parseReferences(formula.toString().substring(1), doc))
      : (!formula && formula !== 0 ? '' : formatCalcResult(formula));
  }
  return formatCalcResult(parseFormula(functionResult, doc, data));
}
