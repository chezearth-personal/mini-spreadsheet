'use strict';

/**
  * For storing address state (could use grid element 0)
  */
let currentCellCoords;

/**
  * Getting and setting the state
  */
export const getCoordsArr = () => currentCellCoords;

export const setCoordsArr = (coordArr) => {
  currentCellCoords = coordArr;
}

/**
  * Sets uop the formula bar
  */
export const createFormulaBar = (size) => `
  <nav id="formula-bar">
    <input type="button" id="refresh-sheet" value=" = " />
    <input type="text" id="formula-input" name="f"  width="100%" />
  </nav>
`;
