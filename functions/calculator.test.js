'use strict';

import { expect } from 'chai';
import { parseExpression } from './calculator.js';
import { configs } from '../config.js';
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
});
