'use strict';

import { expect } from 'chai';
import { parseExpression } from './calculator.js';
import { configs } from '../config.js';
import { createStorageArr } from '../controllers/storageManager.js';

// const dataObj = {
  // storageArr: createStorageArr(configs.sheetSize.columns, configs.sheetSize.rows),
  // builtInFunctions: configs.builtInFunctions
// };
// console.log(dataObj);
// before(() => {
  const dataObj = {
    storageArr: createStorageArr(configs.sheetSize.columns, configs.sheetSize.rows),
    builtInFunctions: configs.builtInFunctions
  };
// });
describe('It must handle basic inputs', () => {
  // describe('It must handle text', () => {
    it('Must handle an expression beginning with \'', () => {
      expect(parseExpression(`'AbCd`, dataObj)).to.equal('AbCd');
    });
  // });
});
