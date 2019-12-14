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

/**
 * A type that can be loslessly serialized to/from JSON.
 *
 * Ugh, the last part of this used to be `{[key: string]: Jsonable}` but this
 * doesn't work because TS will complain that an object which is actually
 * JSON-serializable has no index signature, so I changed the last part to
 * `object` which sort of defeats the purpose of this type, but whatever.
 *
 * More details here: https://github.com/microsoft/TypeScript/issues/1897
 */
export type Jsonable = string|number|boolean|null|Jsonable[]|object;

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

export function partitionArray<T>(arr: T[], testFn: (item: T) => boolean): [T[], T[]] {
  const trueItems: T[] = [];
  const falseItems: T[] = [];

  arr.forEach(item => {
    if (testFn(item)) {
      trueItems.push(item);
    } else {
      falseItems.push(item);
    }
  });

  return [trueItems, falseItems];
}
