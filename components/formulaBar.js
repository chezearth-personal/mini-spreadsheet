
export const formulaBar = (size) => `
  <div id="formula">
    <label> f= </label>
    <input type="text" id="formula" name="f" size="${8 + (20 * size)}ch" />
  </div>
`;
