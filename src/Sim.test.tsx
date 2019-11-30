import { Player, nextPlayerState, Sim, nextSimState, applySimCommand } from "./Sim";

const PLAYER: Player = {
  number: 1,
  position: {x: 0, y: 0},
  velocity: {x: 0, y: 0},
  size: {x: 10, y: 10},
};

const SIM: Sim = {
  players: [PLAYER],
  size: {x: 100, y: 100},
  time: 0
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

describe("nextSimState()", () => {
  it("updates time", () => {
    expect(nextSimState(SIM, 1).time).toBe(1);
  });

  it("keeps players the same if they do not change", () => {
    expect(nextSimState(SIM, 1).players).toBe(SIM.players);
  });
});

describe("applySimCommand()", () => {
  it("changes player velocity", () => {
    expect(applySimCommand(SIM, {
      type: 'set-velocity',
      time: 0,
      playerIndex: 0,
      velocity: {x: 5, y: 0}
    }).players[0].velocity).toEqual({x: 5, y: 0});
  });
});
