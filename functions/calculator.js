'use strict';

import { toCoords } from './addressConverter';
import { funcsList } from '../config.json';

const calcFormula = (formula) => Function(`'use strict'; return (${formula.toString()})`)();

const average = (listArr, doc) => {
  return Array.isArray(listArr) && count(listArr, doc) !== 0
    ? sum(listArr, doc) / count(listArr, doc)
    : '!#DIV0';
}

const count = (listArr, doc) => {
  return Array.isArray(listArr) && listArr
    .filter(listItem => !!doc.getElementById(listItem.join('-')).value || doc.getElementById(listItem.join('-')).value === 0)
    .length;
}

const sum = (listArr, doc) => {
  return Array.isArray(listArr) && listArr
    .reduce((r, item) => {
      // console.log('sum(): item =', item, '; item.join('-') =', item.join('-'), '; doc.getElementById() = ', doc.getElementById(item.join('-')).value);
      const cellValue = doc.getElementById(item.join('-')).value;
      return r + (isNaN(Number(cellValue)) ? cellValue : Number(cellValue));
    }, 0);
}

const rangeHandler = (range) => {
  const rangeArr = range.match(/[A-Z]{1,2}[0-9]{1,3}/g);
  console.log('rangeHandler(): rangeArr =', rangeArr);
  const eArr = rangeArr.map(addr => toCoords(addr));
  console.log('rangeHandler(): eArr =', eArr);
  let cellsArr = [];
  for (let i = Math.min(eArr[0][0], eArr[1][0]); i <= Math.max(eArr[0][0], eArr[1][0]); i++) {
    for (let j = Math.min(eArr[0][1], eArr[1][1]); j <= Math.max(eArr[0][1], eArr[1][1]); j++) {
      cellsArr = cellsArr.concat(Array.of([i, j]));
      // console.log('rangeHandler(): cellsArr =', cellsArr);
    }
  }
  console.log('rangeHandler(): cellsArr =', cellsArr);
  return cellsArr;
}

const listHandler = (list) => {
  return list.split(',')
    .map(item => toCoords(item.trim()));
}

const funcHandler = (listArr, funcName, doc) => {
  if (Array.isArray(listArr)) {
    console.log('funcHandler(): funcName =', funcName);
    if (funcName === 'AVERAGE') {
      return average(listArr, doc);
    } else if (funcName === 'COUNT') {
      return count(listArr, doc);
    } else {
      return sum(listArr, doc);
    }
  }
  return '!#REF';
}

const rangeListHandler = (rangeListFunc, funcName, doc) => {
  console.log('rangeListHandler(): rangeListFunc =', rangeListFunc);
  const rangeList = rangeListFunc.match(/\(.+\)/g)[0].slice(1, -1);
  console.log('rangeListHandler(): rangeList =', rangeList);
  const isRange = /^[A-Z]{1,2}[0-9]{1,3}\:[A-Z]{1,2}[0-9]{1,3}/.test(rangeList);
  const listArr = isRange 
    ? rangeHandler(rangeList)
    : listHandler(rangeList)
  console.log('rangeListHandler(): listArray =', listArr, '; funcName =', funcName);
  const result = funcHandler(listArr, funcName, doc);
  console.log('rangeListHandler(): result = ', result)
  return result;
}

const funcRegexp = (f) => new RegExp(`${f.toUpperCase()}\(.+\)`, 'g');

const parseFuncs = (formula, doc) => {
  console.log('parseFuncs(): formula =', formula);
  const result = funcsList.reduce((r, func) => {
    // console.log('parseFuncs(): res = ', r, '; func = ', func);
    const newFormula = r.toUpperCase().replaceAll(funcRegexp(func), (match) => {
      // console.log('parseFuncs(): match =', match);
      const range = rangeListHandler(match, func, doc);
      console.log('parseFuncs(): range =', range);
      return range.toString();
    });
    return newFormula;
  }, formula);
  const isFormula = funcsList.reduce((r, func) => {
    // console.log('parseFuncs(): regexp =', funcRegexp(func), '; formula =', formula);
    // console.log('parseFuncs(): func =', func, '; funcRegexp(func).test(formula)? ', funcRegexp(func).test(formula.toUpperCase()));
    return r || funcRegexp(func).test(formula.toUpperCase());
  }, false);
  console.log('parseFormula(): isFormula? ', isFormula);
  return isFormula ? result : '';
}

const parseRefs = (formula, doc) => {
  console.log('parseRefs(): doc =', doc);
  return formula.toUpperCase().replaceAll(/[A-Z]{1,2}[0-9]{1,3}/g, (match) => {
    const elem = doc.getElementById(toCoords(match).join('-'));
    return elem ? !elem.value ? 0 : elem.value : '#REF!';
  });
}

export const parseFormula = (formula, doc) => {
  console.log('parseFormula(): formula =', formula);
  const func = parseFuncs(formula, doc);
  console.log('parseFormula(): func = ', func);
  return !func && func !== 0
    ? (formula || '').toString().substring(0, 1) === "="
      ? calcFormula(parseRefs(formula.toString().substring(1), doc))
      : (formula || '' || formula === 0 ? formula : '').toString()
    : func.substring(0, 1) === '=' ? func.toString().substring(1) : func.toString();
}
