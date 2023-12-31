function toColNum(address) {
  let col = address
    ? address.toString()
      .toUpperCase()
      .match(/[A-Z]/g)
      .join("")
      .padStart(2, "@")
      .split("")
      .reverse()
      .reduce((r, e, i) => r + (e.charCodeAt(0) - 64) * Math.pow(26, i), -1)
    : 1;
  return col > 0
    ? col < 101
      ? col
      : 100
    : 0;
}

function toRowNum(address) {
  let row = address ? address.toString().match(/[0-9]/g).join("") : 1;
  return !isNaN(Number(row)) && row > 0
    ? Number(row) < 101
      ? Number(row) - 1
      : 100
    : 0;
}

export function linearToGrid(pos, size) {
  return (pos % (size + 1) - 1).toString()
    + "-"
    + (Math.floor(pos / (size + 1)) - 1).toString();
}

export function toColAddr(colNum) {
  return colNum > -1
    ? colNum < 100 
      ? (colNum > 26 ? String.fromCharCode(Math.floor(colNum / 26) + 64) : "")
        + String.fromCharCode((colNum % 26) + 65)
      : "CV"
    : "A";
}

export function toRowAddr(rowNum) {
  if (!isNaN(Number(rowNum))) {
    let rowInt = Math.floor(rowNum);
    if (rowInt > 0) {
      return rowInt < 100 ? (rowInt + 1).toString() : "100";
    }
    return "1";
  }
}

export function isAddress(address) {
  return !!address
    && address.toString().length > 1
    && /^([A-Z]+)([0-9]+)$/.test(address.toString().toUpperCase());
}

export function isCoordinates(coordArr) {
  return Array.isArray(coordArr) && coordArr.length > 1 && !isNaN(coordArr[0]) && !isNaN(coordArr[1]);
}

/** Converts addresses in the form "A23" or "AZ7" to arrays of coordinates, e.g. [1, 23] or [52, 7] */
export function toCoords(address) {
  return isAddress(address)
    ? Array.of(toColNum(address), toRowNum(address))
    : [0, 0];
}

/** Converts a coordinate array e.g. [3, 31], to an alphanumeric address, e.g. "C31" */
export function toAddress(coordArr) {
  return isCoordinates(coordArr)
    ? (toColAddr(coordArr[0]) + toRowAddr(coordArr[1])).toString()
    : "A1";
}

