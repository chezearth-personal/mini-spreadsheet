const createCells = (size) => Array(Math.pow(size + 1, 2))
    .fill(`<input class="cell" type="text" />`)
    .map((e, i) => i % (size + 1) === 0 || i < size + 2
      ? `<input class="row-header" type="text" />`
      : e)
    .join("\n");

export const sheet = (size) => {
  return `
    <div class="sheet" style="grid-template-columns:5ch repeat(${size}, 14ch)">
      ${createCells(size)}
    </div>
  `;
}
