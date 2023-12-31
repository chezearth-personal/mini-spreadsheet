import './style.css';
import { createFormulaBar, updateFormulaBar } from "./components/formulaBar";
import { createSheet, newArray, navDown, navUp, navRight, navLeft } from './components/sheet';
import { sheetSize } from './config.json';
import { createStorage, saveFormula } from './controllers/storageManager';
import { parseFormula } from './functions/calculator';
// import {toCoords} from './functions/addressConverter';

/**
  * Creates the formula bar and grid on the page, with one additional row and column for the
  * address heading
  */
document.querySelector('#app').innerHTML = `
  <div>
    ${createFormulaBar(sheetSize)}
    ${createSheet(sheetSize)}
  </div>
`;

/**
  * Creates an array (3 dimesions: `size` x `size` x 2) to store formulas and values
  */
export const storageArr = createStorage(sheetSize);

/**
  * Update the formula in the storage array
  */
const updateFormula = (event) => {
  saveFormula(storageArr, event.target.id.split('-'), event.target.value);
  event.target.value = parseFormula(event.target.value);
}

/**
  * Choose navigation depending on the input
  */
const navigate = (event) => {
  const oldCoordsArr = event.target.id.split('-');
  const newCoordsArr = event.code === 'Enter' || (event.code === 'ArrowDown' && !event.target.value)
    ? navDown(oldCoordsArr, sheetSize)
    : event.code === 'ArrowUp' && !event.target.value
      ? navUp(oldCoordsArr)
      : event.code === 'ArrowRight' && !event.target.value
        ? navRight(oldCoordsArr, sheetSize)
        : event.code === 'ArrowLeft' && !event.target.value
          ? navLeft(oldCoordsArr)
          : newArray(oldCoordsArr);
  const toId = newCoordsArr.join('-');
  document.getElementById(toId).focus();
}

/**
  * Create listeners on all the sheet cells for data entry, data updates and keystrokes
  */
const sheet = document.querySelectorAll('input.cell');
sheet.forEach(cell => cell.addEventListener('change', updateFormula));
sheet.forEach(cell => cell.addEventListener('keydown', navigate));
sheet.forEach(cell => cell.addEventListener('input', updateFormulaBar));
