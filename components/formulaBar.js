'use strict';

import { getParentDocument } from './main.js';
import { getFormula } from '../controllers/storageManager.js';
import { handleKeyDown, refreshStorage, getAddress, refreshSheetValues } from './sheet.js';

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

export function updateFormulaBar(event) {
  const currentCellCoordinatesArr = getAddress(event);
  const storageHandler = refreshStorage.bind(this);
  storageHandler(event);
  const keyDownHandler = handleKeyDown.bind(this);
  keyDownHandler(event);
  // console.log('currentCellCoordinatesArr =', currentCellCoordinatesArr);
  getParentDocument(event).getElementById(currentCellCoordinatesArr.join('-')).blur();
  const refreshCells = refreshSheetValues.bind(this);
  refreshCells(event);
}

/**
  * Update the formula bar with the most recent formula edits from the cells
  */
export function refreshFormulaBar(event) {
  const formula = getFormula(this.storageArr, this.cellCoordinatesArr);
  setCellCoordinatesArr(this.cellCoordinatesArr);
  const elem = getParentDocument(event).getElementById(this.cellCoordinatesArr.join('-'));
  getParentDocument(event).getElementById('formula-input').value = (
    !formula
      ? elem.value || '' || elem.value === 0 ? elem.value : ''
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
