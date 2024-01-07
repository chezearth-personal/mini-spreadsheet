'use strict';

import { expect } from 'chai';
import { isAddress, isCoordinates, toAddress, toCoords } from './addressConverter.js';

describe('Test: addressConverter.js', () => {
  describe('It should verifiy inputs', () => {
    describe('It should verify addresses to be coverted to array coordinates', () => {
      describe('The address length should be at least two characters', () => {
        it('should be FALSE for an empty address', () => {
          expect(isAddress('')).to.equal(false);
        });
        it('should be FALSE for an undefined address', () => {
          expect(isAddress(undefined)).to.equal(false);
        });
        it('should be FALSE for a null address', () => {
          expect(isAddress(null)).to.equal(false);
        });
        it('should be FALSE for one character', () => {
          expect(isAddress('A')).to.equal(false);
          expect(isAddress('1')).to.equal(false);
        });
        it('should be TRUE for two characters', () => {
          expect(isAddress('h9')).to.equal(true);
          expect(isAddress('J2')).to.equal(true);
        });
      });
      describe('The address should start with an alphabetic character and end with a number', () => {
        it('should be TRUE for a pattern with one letter at the begining and a number at the end', () => {
          expect(isAddress('a1')).to.equal(true);
        });
        it('should be TRUE for a pattern that has only characters at the begining and at least one number at the end', () => {
          expect(isAddress('dhJz99921')).to.equal(true);
          expect(isAddress('dHjz9')).to.equal(true);
        });
        it('should be FALSE for a pattern that has only characters in it', () => {
          expect(isAddress('zxca')).to.equal(false);
          expect(isAddress('ZXCA')).to.equal(false);
        });
        it('should be FALSE for a pattern that has only numbers in it', () => {
          expect(isAddress('20')).to.equal(false);
          expect(isAddress(20)).to.equal(false);
        });
        it('should be FALSE for a pattern that has non-alphanumeric characters in it', () => {
          expect(isAddress('AC20.0')).to.equal(false);
          expect(isAddress('A2&')).to.equal(false);
        });
      });
    });
    describe('It should verify array coordinates to be converted to addresses', () => {
      describe('The array must have at least two elements', () => {
        it('should be FALSE for an undefined array', () => {
          expect(isCoordinates(undefined)).to.equal(false);
        });
        it('should be FALSE for a null array', () => {
          expect(isCoordinates(null)).to.equal(false);
        });
        it('should be FALSE for an empty array', () => {
          expect(isCoordinates([])).to.equal(false);
        });
        it('should be FALSE for an array with less than 2 elements', () => {
          expect(isCoordinates([2])).to.equal(false);
        });
        it('should be TRUE if there are at least 2 elements that are numbers', () => {
          expect(isCoordinates([4, 2])).to.equal(true);
        });
      });
      describe('The first two elements of the array should be numbers', () => {
        it('should be FALSE if the first 2 elements of the array are not numbers', () => {
          expect(isCoordinates([3, 'Fred', 5])).to.equal(false);
        });
        it('should be TRUE if the first 2 elements of the array are numbers', () => {
          expect(isCoordinates([4, 1.8])).to.equal(true);
          expect(isCoordinates([4, 1.8, 37])).to.equal(true);
          expect(isCoordinates([4, 1.8, 'John'])).to.equal(true);
        });
      });
    });
  });
  describe('It should convert addresses to array coordinates (numbered from 0)', () => {
    describe('Bad addresses should default to [1, 1] (\'A1\')', () => {
      describe('Null, undefined and empty addresses should go to [0, 0] (\'A1\')', () => {
        it('should convert undefined to [0, 0]', () => {
          expect(toCoords(undefined)).to.have.ordered.members([0, 0]);
        });
        it('should convert null to [0, 0]', () => {
          expect(toCoords(null)).to.have.ordered.members([0, 0]);
        });
        it('should convert \'\' to [0, 0]', () => {
          expect(toCoords(undefined)).to.have.ordered.members([0, 0]);
        });
      });
      describe('Addresses that are missing either characters or numbers should go to the top-left [1, 1]', () => {
        it('should convert a number only to column 0', () => {
          expect(toCoords('20')).to.have.ordered.members([0, 0]);
        });
        it('should convert a character only to row 0', () => {
          expect(toCoords('F')).to.have.ordered.members([0, 0]);
        });
      });
      describe('An address that has 0 for its number must go to row 1', () => {
        it('Should convert a zero row to 1, ie. \'C0\' -> [2, 0]', () => {
          expect(toCoords('C0')).to.have.ordered.members([2, 0]);
        });
      });
    });
    describe('Addresses that are out of range must betruncated to 702', () => {
      describe('When the column characters are too big, the first element must be 100', () => {
        it('should set the maximum column to 702, i.e. \'AAA\' -> 702, not 703', () => {
          expect(toCoords('AAA29')).to.have.ordered.members([702, 28]);
        });
      });
      describe('When the row number is too big, the second element must be 702', () => {
        it('should set the maximum row to 702, i.e. \'CM829\' -> [91, 702]', () => {
          expect(toCoords('CM829')).to.have.ordered.members([90, 702]);
        });
      });
    });
    describe('Addresses that are in range should be converted correctly', () => {
      describe('Single-character, single-digit addresses should convert correctly', () => {
        it('should convert \'A2\' to [0, 1]', () => {
          expect(toCoords('A2')).to.have.ordered.members([0, 1]);
        });
        it('should convert \'a2\' to [0, 1]', () => {
          expect(toCoords('a2')).to.have.ordered.members([0, 1]);
        });
      });
      describe('Double-character, double-digit addresses should convert correctly', () => {
        it('should convert \'BL47\' to [63, 46]', () => {
          expect(toCoords('bL47')).to.have.ordered.members([63, 46]);
        });
      });
    });
  });
  describe('It should convert array coordinates to an Excel alphanumeric address', () => {
    describe('Coordinates that are out of range should be trancated to \'ZZ\' and 702', () => {
      describe('Coordinates with large column numbers must be limited to \'ZZ\'', () => {
        it('should truncate large column numbers over 1000 to \'ZZ\'', () => {
          expect(toAddress([1037, 42])).to.equal('ZZ43');
        });
      });
      describe('Coordinates with large row numbers must be limited to 702', () => {
        it('should truncate large row numbers over 702 to 702', () => {
          expect(toAddress([90, 714])).to.equal('CM702');
        });
      });
    });
    describe('It should convert array coordinate in range correctly', () => {
      describe('Coordinates in-range should convert accurately', () => {
        it('should convert smaller in-range numbers to two-alphanumeric characters, e.g. [17, 8] to \'Q8\'', () => {
          expect(toAddress([16, 7])).to.equal('Q8');
        });
        it('should convert larger in-range numbers to four alphanumeric characters, e.g. [67, 73] to \'BO73\'', () => {
          expect(toAddress([66, 72])).to.equal('BO73');
        });
      });
    });
  });
});
