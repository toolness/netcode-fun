export function memoryConservingMap<T>(arr: T[], mapFn: (item: T) => T): T[] {
  const mappedArr: T[] = [];
  let changed = false;

  arr.forEach(item => {
    const mappedItem = mapFn(item);
    if (mappedItem !== item && !changed) {
      changed = true;
    }
    mappedArr.push(mappedItem)
  });

  return changed ? mappedArr : arr;
}
