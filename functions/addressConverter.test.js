// const chai = require("chai").expect;
// import { expect } from "chai";
import { expect } from 'chai';

import { isAddress, isCoordinates, toAddress, toCoords } from "./addressConverter.js";

console.log(isAddress("A1"));
console.log(isAddress("A"));
console.log(toCoords("B12"));
// console.log(chai);
describe("addressConverter.js", () => {
  describe("It should verifiy inputs", () => {
    describe("It should verify addresses", () => {
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
      describe("It should start with an alphabetic character and end with a number", () => {
        it("should be TRUE for a pattern with one letter at the begining and a number at the end", () => {
          expect(isAddress("a1")).to.equal(true);
          expect(isAddress("zxca")).to.equal(false);
          expect(isAddress("20")).to.equal(false);
          expect(isAddress(20)).to.equal(false);
        });
        it("should be TRUE for a pattern that has only characters at the begining and at least one number at the end", () => {
          expect(isAddress("dhJz99921")).to.equal(true);
          expect(isAddress("dHjz9")).to.equal(true);
          expect(isAddress("20")).to.equal(false);
          expect(isAddress(20)).to.equal(false);
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
  });
});
