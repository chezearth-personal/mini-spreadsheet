'use strict';

import { expect } from 'chai';
import { parseExpression } from './calculator.js';
import configs from '../config.json' assert {type: 'json'};
import { createStorageArr } from '../controllers/storageManager.js';

const dataObj = {
  storageArr: createStorageArr(configs.sheetSize.columns, configs.sheetSize.rows),
  builtInFunctions: configs.builtInFunctions
};
describe('It must handle basic inputs', function() {
  describe('It must handle text', function() {
    it('Must handle an expression beginning with \'', function() {
      expect(parseExpression(`'AbCd`, dataObj)).to.equal('AbCd');
    });
    it('Must handle a mix of characters and numbers that are text', function() {
      expect(parseExpression(`AbCd123`, dataObj)).to.equal('AbCd123');
    });
  });
  describe('It must handle numbers', function() {
    it('Must handle a number', function() {
      expect(parseExpression(`123`, dataObj)).to.equal(`123`);
    });
    it('Must handle a negative number', function() {
      expect(parseExpression(`-123`, dataObj)).to.equal(`-123`);
    });
    it('Must handle a decimal number', function() {
      expect(parseExpression(`123.456`, dataObj)).to.equal(`123.456`);
    });
    it('Must handle a negative decimal number', function() {
      expect(parseExpression(`-123.456`, dataObj)).to.equal(`-123.456`);
    });
    it('Must handle a number starting with a decimal', function() {
      expect(parseExpression(`.456`, dataObj)).to.equal(`0.456`);
    });
    it('Must handle a negative number starting with a decimal', function() {
      expect(parseExpression(`-.456`, dataObj)).to.equal(`-0.456`);
    });
    it('Must handle a number starting with multiple negative signs', function() {
      expect(parseExpression(`--456.`, dataObj)).to.equal(`456`);
      expect(parseExpression(`---456.`, dataObj)).to.equal(`-456`);
      expect(parseExpression(`----456.`, dataObj)).to.equal(`456`);
    });
    it('Must handle multiple negative signs and a leading decomal', function() {
      expect(parseExpression(`---.456`, dataObj)).to.equal(`-0.456`);
      expect(parseExpression(`----.456`, dataObj)).to.equal(`0.456`);
    });
  });
  describe(`It must ignore formulae that do not start with '=', '+' or '-'`, function() {
    it('Must ignore a formula that does not start with =', function() {
      expect(parseExpression(`1+1`, dataObj)).to.equal(`1+1`);
    });
    it('Must ignore a formula that starts with +', function() {
      expect(parseExpression(`1-1`, dataObj)).to.equal(`1-1`);
    });
    it('Must ignore a formula that starts with -', function() {
      expect(parseExpression(`1*3`, dataObj)).to.equal(`1*3`);
    });
  });
  describe('It must handle formulae with numbers', function() {
    it('Must handle a simple positive integer', function() {
      expect(parseExpression(`=1`, dataObj)).to.equal(`1`);
    });
    it('Must handle a simple negative integer', function() {
      expect(parseExpression(`=-1`, dataObj)).to.equal(`-1`);
    });
    it('Must handle a simple positive decimal', function() {
      expect(parseExpression(`=1.1`, dataObj)).to.equal(`1.1`);
    });
    it('Must handle a simple negative decimal', function() {
      expect(parseExpression(`=-1.1`, dataObj)).to.equal(`-1.1`);
    });
    it('Must handle a simple positive decimal with a leading decimal', function() {
      expect(parseExpression(`=.1`, dataObj)).to.equal(`0.1`);
    });
    it('Must handle a simple negative decimal with a leading decimal', function() {
      expect(parseExpression(`=-.1`, dataObj)).to.equal(`-0.1`);
    });
  });
  describe('It must return errors for formulae with invalid expressions', function() {
    it(`Must return a '#NAME?' error for an invalid formula with a text quote`, function() {
      expect(parseExpression(`='1`, dataObj)).to.equal(`#NAME?`);
    });
  });
  describe('It must handle basic formulae', function() {
    it('Must handle a simple addition', function() {
      expect(parseExpression(`=1+1`, dataObj)).to.equal(`2`);
    });
    it('Must handle a simple subtraction', function() {
      expect(parseExpression(`=1-1`, dataObj)).to.equal(`0`);
    });
    it('Must handle a simple multiplication', function() {
      expect(parseExpression(`=2*2`, dataObj)).to.equal(`4`);
    });
    it('Must handle a simple division', function() {
      expect(parseExpression(`=4/2`, dataObj)).to.equal(`2`);
    });
    it('Must handle simple double operations', function() {
      expect(parseExpression(`=2--3`, dataObj)).to.equal(`5`);
      expect(parseExpression(`=2+-3`, dataObj)).to.equal(`-1`);
    });
  });
  describe('It must handle formulae with parentheses', function() {
    it('Must handle a simple addition', function() {
      expect(parseExpression(`=(1+1)`, dataObj)).to.equal(`2`);
    });
    it('Must handle a simple subtraction', function() {
      expect(parseExpression(`=(1-1)`, dataObj)).to.equal(`0`);
    });
    it('Must handle a simple multiplication', function() {
      expect(parseExpression(`=(2*2)`, dataObj)).to.equal(`4`);
    });
    it('Must handle a simple division', function() {
      expect(parseExpression(`=(4/2)`, dataObj)).to.equal(`2`);
    });
    it('Must handle simple double operations', function() {
      expect(parseExpression(`=(2--3)`, dataObj)).to.equal(`5`);
      expect(parseExpression(`=(2+-3)`, dataObj)).to.equal(`-1`);
    });
  });
  describe('It must handle formulae with parentheses and numbers', function() {
    it('Must handle a simple addition', function() {
      expect(parseExpression(`=1+(1+1)`, dataObj)).to.equal(`3`);
    });
    it('Must handle a simple subtraction', function() {
      expect(parseExpression(`=1-(1-1)`, dataObj)).to.equal(`1`);
    });
    it('Must handle a simple multiplication', function() {
      expect(parseExpression(`=2*(2*2)`, dataObj)).to.equal(`8`);
    });
    it('Must handle a simple division', function() {
      expect(parseExpression(`=4/(4/2)`, dataObj)).to.equal(`2`);
    });
    it('Must handle simple double operations', function() {
      expect(parseExpression(`=2-(2--3)`, dataObj)).to.equal(`-3`);
      expect(parseExpression(`=2+(2+-3)`, dataObj)).to.equal(`1`);
    });
  });
  describe('It must handle formulae with references', function() {
    dataObj.storageArr[0][1][0] = '=1'; /** A2 */
    dataObj.storageArr[0][2][0] = '=a2*2'; /** A3 */
    dataObj.storageArr[0][3][0] = '=A2 + a3'; /** A4 */
    dataObj.storageArr[0][4][0] = '4'; /** A5 */
    describe('It must handle formula with simple references', function() {
      it('Must resolve a reference to an empty cell', function() {
        expect(parseExpression(`=b5`, dataObj)).to.equal(`0`);
      });
      it('Must resolve a reference to a cell with a number', function() {
        expect(parseExpression(`=a2`, dataObj)).to.equal(`1`);
      });
    });
    describe('It must handle formulae with references and numbers', function() {
      it('Must resolve a reference to a cell with a simple formula', function() {
        expect(parseExpression(`=a3`, dataObj)).to.equal(`2`);
      });
      it('Must resolve a reference to a cell with a simple formula containing whitespaces', function() {
        expect(parseExpression(`= a4`, dataObj)).to.equal(`3`);
      });
    });
  });
  describe('It must handle formulae with built-in functions', function() {
    describe('It must sum a range numbers and place the result in a cell', function() {
      dataObj.storageArr[0][5][0] = '=SUM(A2:a4)'; /** A6 */
      it('Must retrieve a cell containg a simple sum', function() {
        expect(parseExpression(`=A6`, dataObj)).to.equal(`6`);
      });
    });
    describe('It must perform a complex combination of operations and SUM functions over a range', function() {
      it('Must add a reference to a SUM() of listed refs containing a SUM() of a range', function() {
        expect(parseExpression(`=A1 + A2 + SUM(A3, SUM(A4:A6))`, dataObj)).to.equal(`16`);
      });
    });
  });
});
