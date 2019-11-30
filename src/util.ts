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

export type Jsonable = string|number|boolean|null|Jsonable[]|{[property: string]: Jsonable};

export function clone<T extends Jsonable>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
