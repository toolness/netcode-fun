import { Player, nextPlayerState } from "./Sim";

const PLAYER: Player = {
  number: 1,
  position: {x: 0, y: 0},
  velocity: {x: 0, y: 0},
  size: {x: 10, y: 10},
};

describe("nextPlayerState()", () => {
  it("returns player when velocity is zero", () => {
    expect(nextPlayerState(PLAYER, 50)).toBe(PLAYER);
  });

  it("updates velocity", () => {
    const p: Player = {...PLAYER, velocity: {x: 0.7683032686776416, y: 0}};
    expect(nextPlayerState(p, 59).position).toEqual({
      x: 45.32989285198085,
      y: 0
    });
  });
});
