import { expect } from 'chai';
import { isAddress, isCoordinates, toAddress, toCoords } from "./addressConverter.js";

describe("Test: addressConverter.js", () => {
  describe("It should verifiy inputs", () => {
    describe("It should verify addresses to be coverted to array coordinates", () => {
      describe("The address length should be at least two characters", () => {
        it("should be FALSE for an empty address", () => {
          expect(isAddress("")).to.equal(false);
        });
        it("should be FALSE for an undefined address", () => {
          expect(isAddress(undefined)).to.equal(false);
        });
        it("should be FALSE for a null address", () => {
          expect(isAddress(null)).to.equal(false);
        });
        it("should be FALSE for one character", () => {
          expect(isAddress("A")).to.equal(false);
          expect(isAddress("1")).to.equal(false);
        });
        it("should be TRUE for two characters", () => {
          expect(isAddress("h9")).to.equal(true);
          expect(isAddress("J2")).to.equal(true);
        });
      });
      describe("The address should start with an alphabetic character and end with a number", () => {
        it("should be TRUE for a pattern with one letter at the begining and a number at the end", () => {
          expect(isAddress("a1")).to.equal(true);
        });
        it("should be TRUE for a pattern that has only characters at the begining and at least one number at the end", () => {
          expect(isAddress("dhJz99921")).to.equal(true);
          expect(isAddress("dHjz9")).to.equal(true);
        });
        it("should be FALSE for a pattern that has only characters in it", () => {
          expect(isAddress("zxca")).to.equal(false);
          expect(isAddress("ZXCA")).to.equal(false);
        });
        it("should be FALSE for a pattern that has only numbers in it", () => {
          expect(isAddress("20")).to.equal(false);
          expect(isAddress(20)).to.equal(false);
        });
        it("should be FALSE for a pattern that has non-alphanumeric characters in it", () => {
          expect(isAddress("AC20.0")).to.equal(false);
          expect(isAddress("A2&")).to.equal(false);
        });
      });
    });
    describe("It should verify array coordinates to be converted to addresses", () => {
      describe("The array must have at least two elements", () => {
        it("should be FALSE for an undefined array", () => {
          expect(isCoordinates(undefined)).to.equal(false);
        });
        it("should be FALSE for a null array", () => {
          expect(isCoordinates(null)).to.equal(false);
        });
        it("should be FALSE for an empty array", () => {
          expect(isCoordinates([])).to.equal(false);
        });
        it("should be FALSE for an array with less than 2 elements", () => {
          expect(isCoordinates([2])).to.equal(false);
        });
        it("should be TRUE if there are at least 2 elements that are numbers", () => {
          expect(isCoordinates([4, 2])).to.equal(true);
        });
      });
      describe("The first two elements of the array should be numbers", () => {
        it("should be FALSE if the first 2 elements of the array are not numbers", () => {
          expect(isCoordinates([3, "Fred", 5])).to.equal(false);
        });
        it("should be TRUE if the first 2 elements of the array are numbers", () => {
          expect(isCoordinates([4, 1.8])).to.equal(true);
          expect(isCoordinates([4, 1.8, 37])).to.equal(true);
          expect(isCoordinates([4, 1.8, "John"])).to.equal(true);
        });
      });
    });
  });
  describe("It should convert addresses to array coordinates (numbered from 1, column and row 0 for the headings", () => {
    describe("Bad addresses should default to [1, 1] ('A1')", () => {
      describe("Null, undefined and empty addresses should go to [1, 1] ('A1')", () => {
        it("should convert undefined to [1, 1]", () => {
          expect(toCoords(undefined)).to.have.ordered.members([1, 1]);
        });
        it("should convert null to [1, 1]", () => {
          expect(toCoords(null)).to.have.ordered.members([1, 1]);
        });
        it("should convert '' to [1, 1]", () => {
          expect(toCoords(undefined)).to.have.ordered.members([1, 1]);
        });
      });
      describe("Addresses that are missing either characters or numbers should go to the top-left [1, 1]", () => {
        it("should convert a number only to column 1", () => {
          expect(toCoords("20")).to.have.ordered.members([1, 1]);
        });
        it("should convert a character only to row 1", () => {
          expect(toCoords("F")).to.have.ordered.members([1, 1]);
        });
      });
      describe("An address that has 0 for its number must go to row 1", () => {
        it("Should convert a zero row to 1, ie. 'C0' -> [3, 1]", () => {
          expect(toCoords("C0")).to.have.ordered.members([3, 1]);
        });
      });
    });
    describe("Addresses that are out of range must betruncated to 100", () => {
      describe("When the column characters are too big, the first element must be 100", () => {
        it("should set the maximum column to 100, i.e. 'DX' -> 100, not 128", () => {
          expect(toCoords("DX29")).to.have.ordered.members([100, 29]);
        });
      });
      describe("When the row number is too big, the second element must be 100", () => {
        it("should set the maximum row to 100, i.e. 'CM329' -> [91, 100]", () => {
          expect(toCoords("CM329")).to.have.ordered.members([91, 100]);
        });
      });
    });
    describe("Addresses that are in range should be converted correctly", () => {
      describe("Single-character, single-digit addresses should convert correctly", () => {
        it("should convert 'A2' to [1, 2]", () => {
          expect(toCoords("A2")).to.have.ordered.members([1, 2]);
        });
        it("should convert 'a2' to [1, 2]", () => {
          expect(toCoords("a2")).to.have.ordered.members([1, 2]);
        });
      });
      describe("Double-character, double-digit addresses should convert correctly", () => {
        it("should convert 'BL47' to [64, 47]", () => {
          expect(toCoords("bL47")).to.have.ordered.members([64, 47]);
        });
      });
    });
  });
  describe("It should convert array coordinates to an Excel alphanumeric address", () => {
    describe("Coordinates that are out of range should be trancated to 'CV' and 100", () => {
      describe("Coordinates with large column numbers must be limited to 'CV'", () => {
        it("should truncate large column numbers over 100 to 'CV'", () => {
          expect(toAddress([137, 43])).to.equal('CV43');
        });
      });
      describe("Coordinates with large row numbers must be limited to 100", () => {
        it("should truncate large row numbers over 100 to 100", () => {
          expect(toAddress([91, 714])).to.equal('CM100');
        });
      });
    });
    describe("It should convert array coordinate in range correctly", () => {
      describe("Coordinates in-range should convert accurately", () => {
        it("should convert smaller in-range numbers to two-alphanumeric characters, e.g. [17, 8] to 'Q8'", () => {
          expect(toAddress([17, 8])).to.equal("Q8");
        });
        it("should convert larger in-range numbers to four alphanumeric characters, e.g. [67, 73] to 'BO73'", () => {
          expect(toAddress([67, 73])).to.equal("BO73");
        });
      });
    });
  });
});
