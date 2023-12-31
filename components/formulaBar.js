// import { saveFormula } from "../controllers/storageManager";

export const createFormulaBar = (size) => `
  <div id="formula-bar">
    <label>
      f= 
      <input type="text" id="formula-input" name="f" size="${8 + (20 * size)}ch" />
    </label>
  </div>
`;

export const updateFormulaBar = (event) => {
  document.getElementById('formula-input').value = event.target.value;
}
