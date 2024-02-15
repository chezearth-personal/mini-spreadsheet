'use strict';

import { expect } from 'chai';
import { isAddress, isCoordinates, toCellAddress, toCellCoordinates } from './addressConverter.js';

describe('Test: addressConverter.js', function() {
  describe('It should verifiy inputs', function() {
    describe('It should verify addresses to be coverted to array coordinates', function() {
      describe('The address length should be at least two characters', function() {
        it('should be FALSE for an empty address', function() {
          expect(isAddress('')).to.equal(false);
        });
        it('should be FALSE for an undefined address', function() {
          expect(isAddress(undefined)).to.equal(false);
        });
        it('should be FALSE for a null address', function() {
          expect(isAddress(null)).to.equal(false);
        });
        it('should be FALSE for one character', function() {
          expect(isAddress('A')).to.equal(false);
          expect(isAddress('1')).to.equal(false);
        });
        it('should be TRUE for two characters', function() {
          expect(isAddress('h9')).to.equal(true);
          expect(isAddress('J2')).to.equal(true);
        });
      });
      describe('The address should start with an alphabetic character and end with a number', function() {
        it('should be TRUE for a pattern with one letter at the begining and a number at the end', function() {
          expect(isAddress('a1')).to.equal(true);
        });
        it('should be TRUE for a pattern that has only characters at the begining and at least one number at the end', function() {
          expect(isAddress('dhJz99921')).to.equal(true);
          expect(isAddress('dHjz9')).to.equal(true);
        });
        it('should be FALSE for a pattern that has only characters in it', function() {
          expect(isAddress('zxca')).to.equal(false);
          expect(isAddress('ZXCA')).to.equal(false);
        });
        it('should be FALSE for a pattern that has only numbers in it', function() {
          expect(isAddress('20')).to.equal(false);
          expect(isAddress(20)).to.equal(false);
        });
        it('should be FALSE for a pattern that has non-alphanumeric characters in it', function() {
          expect(isAddress('AC20.0')).to.equal(false);
          expect(isAddress('A2&')).to.equal(false);
        });
      });
    });
    describe('It should verify array coordinates to be converted to addresses', function() {
      describe('The array must have at least two elements', function() {
        it('should be FALSE for an undefined array', function() {
          expect(isCoordinates(undefined)).to.equal(false);
        });
        it('should be FALSE for a null array', function() {
          expect(isCoordinates(null)).to.equal(false);
        });
        it('should be FALSE for an empty array', function() {
          expect(isCoordinates([])).to.equal(false);
        });
        it('should be FALSE for an array with less than 2 elements', function() {
          expect(isCoordinates([2])).to.equal(false);
        });
        it('should be TRUE if there are at least 2 elements that are numbers', function() {
          expect(isCoordinates([4, 2])).to.equal(true);
        });
      });
      describe('The first two elements of the array should be numbers', function() {
        it('should be FALSE if the first 2 elements of the array are not numbers', function() {
          expect(isCoordinates([3, 'Fred', 5])).to.equal(false);
        });
        it('should be TRUE if the first 2 elements of the array are numbers', function() {
          expect(isCoordinates([4, 1.8])).to.equal(true);
          expect(isCoordinates([4, 1.8, 37])).to.equal(true);
          expect(isCoordinates([4, 1.8, 'John'])).to.equal(true);
        });
      });
    });
  });
  describe('It should convert addresses to array coordinates (numbered from 0)', function() {
    describe('Bad addresses should default to [1, 1] (\'A1\')', function() {
      describe('Null, undefined and empty addresses should go to [0, 0] (\'A1\')', function() {
        it('should convert undefined to [0, 0]', function() {
          expect(toCellCoordinates(undefined)).to.have.ordered.members([0, 0]);
        });
        it('should convert null to [0, 0]', function() {
          expect(toCellCoordinates(null)).to.have.ordered.members([0, 0]);
        });
        it('should convert \'\' to [0, 0]', function() {
          expect(toCellCoordinates(undefined)).to.have.ordered.members([0, 0]);
        });
      });
      describe('Addresses that are missing either characters or numbers should go to the top-left [1, 1]', function() {
        it('should convert a number only to column 0', function() {
          expect(toCellCoordinates('20')).to.have.ordered.members([0, 0]);
        });
        it('should convert a character only to row 0', function() {
          expect(toCellCoordinates('F')).to.have.ordered.members([0, 0]);
        });
      });
      describe('An address that has 0 for its number must go to row 1', function() {
        it('Should convert a zero row to 1, ie. \'C0\' -> [2, 0]', function() {
          expect(toCellCoordinates('C0')).to.have.ordered.members([2, 0]);
        });
      });
    });
    describe('Addresses that are out of range must betruncated to 702', function() {
      describe('When the column characters are too big, the first element must be 100', function() {
        it('should set the maximum column to 702, i.e. \'AAA\' -> 702, not 703', function() {
          expect(toCellCoordinates('AAA29')).to.have.ordered.members([702, 28]);
        });
      });
      describe('When the row number is too big, the second element must be 702', function() {
        it('should set the maximum row to 702, i.e. \'CM829\' -> [91, 702]', function() {
          expect(toCellCoordinates('CM829')).to.have.ordered.members([90, 702]);
        });
      });
    });
    describe('Addresses that are in range should be converted correctly', function() {
      describe('Single-character, single-digit addresses should convert correctly', function() {
        it('should convert \'A2\' to [0, 1]', function() {
          expect(toCellCoordinates('A2')).to.have.ordered.members([0, 1]);
        });
        it('should convert \'a2\' to [0, 1]', function() {
          expect(toCellCoordinates('a2')).to.have.ordered.members([0, 1]);
        });
      });
      describe('Double-character, double-digit addresses should convert correctly', function() {
        it('should convert \'BL47\' to [63, 46]', function() {
          expect(toCellCoordinates('bL47')).to.have.ordered.members([63, 46]);
        });
      });
    });
  });
  describe('It should convert array coordinates to an Excel alphanumeric address', function() {
    describe('Coordinates that are out of range should be trancated to \'ZZ\' and 702', function() {
      describe('Coordinates with large column numbers must be limited to \'ZZ\'', function() {
        it('should truncate large column numbers over 1000 to \'ZZ\'', function() {
          expect(toCellAddress([1037, 42])).to.equal('ZZ43');
        });
      });
      describe('Coordinates with large row numbers must be limited to 702', function() {
        it('should truncate large row numbers over 702 to 702', function() {
          expect(toCellAddress([90, 714])).to.equal('CM702');
        });
      });
    });
    describe('It should convert array coordinate in range correctly', function() {
      describe('Coordinates in-range should convert accurately', function() {
        it('should convert smaller in-range numbers to two-alphanumeric characters, e.g. [17, 8] to \'Q8\'', function() {
          expect(toCellAddress([16, 7])).to.equal('Q8');
        });
        it('should convert larger in-range numbers to four alphanumeric characters, e.g. [67, 73] to \'BO73\'', function() {
          expect(toCellAddress([66, 72])).to.equal('BO73');
        });
      });
    });
  });
});
