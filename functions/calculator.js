

export const createStorage = (size) => {
  return Array.from(Array(size), () => Array.from(Array(size), () => new Array(2)));
}

export const loadFormula = (val, address) => {
  return Array.isArray(address) && address.length > 1 ? storage[address[0]][address[1]][0] : null;
}

export const storageArr = createStorage()
