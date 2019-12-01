import { memoryConservingMap, clone, replaceArrayEntry, partitionArray } from "./util";

describe("memoryConservingMap()", () => {
  it("returns identical array when array is unchanged", () => {
    const arr = [1, 2, 3];
    const mapped = memoryConservingMap(arr, x => x);
    expect(mapped).toBe(arr);
    expect(mapped).toEqual([1, 2, 3]);
  });

  it("returns different array when array is changed", () => {
    const arr = [1, 2, 3];
    const mapped = memoryConservingMap(arr, x => 2 * x);
    expect(mapped).not.toBe(arr);
    expect(arr).toEqual([1, 2, 3]);
    expect(mapped).toEqual([2, 4, 6]);
  });
});

describe("clone()", () => {
  it("preserves floats", () => {
    for (let i = 0; i < 1000; i++) {
      const num = Math.random();
      expect(clone(num)).toBe(num);
    }
  });
});

describe("replaceArrayEntry()", () => {
  it("works", () => {
    expect(replaceArrayEntry([1,2,3], 0, 5)).toEqual([5,2,3]);
  });

  it("throws out of bounds errors", () => {
    expect(() => replaceArrayEntry([], 0, 1)).toThrow('Array index 0 is out of bounds');
    expect(() => replaceArrayEntry([1], -1, 1)).toThrow('Array index -1 is out of bounds');
    expect(() => replaceArrayEntry([1], 99, 1)).toThrow('Array index 99 is out of bounds');
  });
});

describe("partitionArray()", () => {
  it("works with empty arrays", () => {
    expect(partitionArray([], () => false)).toEqual([[], []]);
  });

  it("works with non-empty arrays", () => {
    expect(partitionArray([1, 2, 3], val => val <= 2)).toEqual([[1, 2], [3]]);
  });
});
