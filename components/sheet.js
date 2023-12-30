import { toRowAddr, toColAddr, linearToGrid } from "../functions/addressConverter.js";

const makeHeader = (pos, size) => pos % (size + 1) === 0 && pos > size
  ? toRowAddr(pos / (size + 1))
  : pos === 0 ? "" : toColAddr(pos);

const createCells = (size) => Array(Math.pow(size + 1, 2))
    .fill(`<input class=`)
    .map((e, i) => i % (size + 1) === 0 || i < size + 2
      ? `${e}"grid-header" disabled="true" type="text" value="${makeHeader(i, size)}" />`
      : `${e}"cell" id=${linearToGrid(i, size)} type="text" />`)
    .join("\n");

export const sheet = (size) => {
  return `
    <div class="sheet" style="grid-template-columns:5ch repeat(${size}, 14ch)">
      ${createCells(size)}
    </div>
  `;
}
