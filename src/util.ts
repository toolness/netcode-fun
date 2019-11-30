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

export function replaceArrayEntry<T>(arr: T[], index: number, entry: T): T[] {
  if (index < 0 || index >= arr.length) {
    throw new Error(`Array index ${index} is out of bounds`);
  }
  const result = arr.slice();
  result.splice(index, 1, entry);
  return result;
}

export type Jsonable = string|number|boolean|null|Jsonable[]|{[property: string]: Jsonable};

export function clone<T extends Jsonable>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}
