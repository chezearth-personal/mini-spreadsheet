import './style.css';
import { formulaBar } from "./components/formulaBar.js";
import { sheet } from './components/sheet';
import { createStorage } from './functions/calculator';
// import javascriptLogo from './javascript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.js'

/**
  * Universal constant to determine the sheet size
  */
const size = 4;

/**
  * Creates the formula bar and grid on the page, with one additional row and column for the
  * address heading
  */
document.querySelector('#app').innerHTML = `
  <div>
    ${formulaBar(size)}
    ${sheet(size)}
  </div>
`;

/**
  * Creates an array (3 dimesions: `size` x `size` x 2) to store formulas and values
  */
const storageArr = createStorage(size);

/**
  * On entering text, check if the last caharcter entered is "\n", if so calculate the whole
  * sheet and save the values.
  */
const checkEntry = (entry, address) => "Done";

