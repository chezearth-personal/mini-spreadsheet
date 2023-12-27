function toColNum(address) {
  let col = address
    ? address.toString()
      .toUpperCase()
      .match(/[A-Z]/g)
      .join("")
      .padStart(2, " ")
      .split("")
      .reduce((r, e) => r + e.charCodeAt(0) - 48, 0)
    : 1;
  return col > 0
    ? col < 100
      ? col
      : 100
    : 1;
}

function toRowNum(address) {
  let row = address ? address.toString().match(/[0-9]/g).join("") : 1;
  return !isNaN(Number(row)) && row > 0
    ? Number(row) < 100
      ? Number(row)
      : 100
    : 1;
}

function toColAddr(coordArr) {
  return coordArr[0] > 0
    ? coordArr[0] < 100 
      ? String.fromCharCode((coordArr[0] / 26) + 48) + String.fromCharCode((coordArr[0] % 26) + 48)
      : "CV"
    : "A";
}

function toRowAddr(coordArr) {
  return coordArr[1] > 0
    ? coordArr[1] < 100
      ? coordArr[1].toString()
      : "100"
    : "1";
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
    ? Array.of(toColNum(address)).concat(toRowNum(address))
    : [1, 1];
}

/** Converts a coordinate array e.g. [3, 31], to an alphanumeric address, e.g. "C31" */
export function toAddress(coordArr) {
  return isCoordinates(coordArr)
    ? (toColAddr(coordArr) + toRowAddr(coordArr)).toString()
    : "A1";
}

