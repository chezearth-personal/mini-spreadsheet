
export const formulaBar = (size) => `
  <div id="formula">
    <label> f= </label>
    <input type="text" id="formula" name="f" length="${5 + 14 * size}ch" />
  </div>
`;
