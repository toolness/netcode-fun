import { memoryConservingMap, clone } from "./util";

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
