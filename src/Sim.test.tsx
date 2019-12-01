import { Player, nextPlayerState, Sim, nextSimState, applySimCommand, SimRunner } from "./Sim";

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
    expect(nextPlayerState(PLAYER, SIM, 50)).toBe(PLAYER);
  });

  it("updates velocity", () => {
    const p: Player = {...PLAYER, velocity: {x: 0.7683032686776416, y: 0}};
    expect(nextPlayerState(p, SIM, 59).position).toEqual({
      x: 45.32989285198085,
      y: 0
    });
  });

  it("clamps position", () => {
    const p: Player = {...PLAYER, velocity: {x: 50, y: 40}};
    expect(nextPlayerState(p, SIM, 100).position).toEqual({
      x: 90,
      y: 90
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

describe("SimRunner", () => {
  it("applies input instantly", () => {
    const sr = new SimRunner(SIM);
    sr.setPlayerVelocity(0, {x: 1, y: 1});
    sr.tick();
    expect(sr.currentState.players[0].velocity).toEqual({x: 1, y: 1});
  });

  it("delays input", () => {
    const sr = new SimRunner(SIM, {inputTickDelay: 1});
    sr.setPlayerVelocity(0, {x: 1, y: 1});
    sr.tick();
    expect(sr.currentState.players[0].velocity).toEqual({x: 0, y: 0});
    sr.tick();
    expect(sr.currentState.players[0].velocity).toEqual({x: 1, y: 1});
  });

  it("expunges old history", () => {
    const sr = new SimRunner(SIM, {historyLength: 2});
    for (let i = 0; i < 20; i++) {
      sr.tick();
    }
    expect(sr.history.length).toBe(2);
  });

  it("rolls back and applies commands that happened in the past", () => {
    const sr = new SimRunner(SIM);
    const xAt = (time: number) => sr.getStateAtTime(time).players[0].position.x;

    sr.tick();
    sr.tick();

    expect(sr.currentState.time).toBe(2);
    expect(xAt(0)).toBe(0);
    expect(xAt(1)).toBe(0);
    expect(xAt(2)).toBe(0);

    sr.queuedCommands.push({
      type: 'set-velocity',
      time: 0,
      playerIndex: 0,
      velocity: {x: 5, y: 0}
    });
    sr.tick();

    expect(sr.currentState.time).toBe(3);
    expect(xAt(0)).toBe(0);
    expect(xAt(1)).toBe(5);
    expect(xAt(2)).toBe(10);
    expect(xAt(3)).toBe(15);
    expect(sr.currentState.players[0].velocity).toEqual({x: 5, y: 0});
  });
});
