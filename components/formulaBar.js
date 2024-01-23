'use strict';

import { getParentDocument } from './main.js';
import { getFormula } from '../controllers/storageManager.js';
/**
  * For storing address state (could use grid element 0)
  */
let currentCellCoordinates;

/**
  * Getting and setting the state
  */
export const getCellCoordinatesArr = () => !currentCellCoordinates
  ? zeroArray()
  : currentCellCoordinates;

export const setCellCoordinatesArr = (cellCoordinatesArr) => {
  currentCellCoordinates = cellCoordinatesArr;
}

/**
  * Update the formula bar with the most recent formula edits from the cells
  */
export const refreshFormulaBar = (storageArr, event, cellCoordinatesArr) => {
  // console.log(storageArr, event.target.id, event.target.id.split['-']);
  const formula = getFormula(storageArr, cellCoordinatesArr);
  setCellCoordinatesArr(cellCoordinatesArr);
  const elem = getParentDocument(event).getElementById(cellCoordinatesArr.join('-'));
  getParentDocument(event).getElementById('formula-input').value = (
    !formula
      ? elem.value || '' || elem.value === 0
        ? elem.value
        : ''
      : formula || '' || formula === 0 ? formula : ''
  );
}

/**
  * Creates and array with two elements, each 0
  */
export const zeroArray = () => Array.of('0', '0');

/**
  * Sets uop the formula bar
  */
export const createFormulaBar = () => `
  <header id="formula-bar">
    <input class="button" type="button" id="refresh" value=" = " />
    <input type="text" id="formula-input" name="f"  size="100%" />
    <input class="button format-button" type="button" id="format-bold" value=" B " />
    <input class="button format-button" type="button" id="format-italic" value=" I " />
    <input class="button format-button" type="button" id="format-underline" value="U" />
    <p class="author">© Charles Rethman</p>
  </header>
`;
