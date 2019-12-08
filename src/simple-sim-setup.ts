import { Vec2, vec2Subtract, VEC2_ZERO } from "./Vec2";
import { Player, Sim } from "./Sim";

const PLAYER_SIZE: Vec2 = {x: 5, y: 5};
const SIM_SIZE: Vec2 = {x: 100, y: 100};

const INITIAL_P1: Player = {
  number: 1,
  position: VEC2_ZERO,
  velocity: VEC2_ZERO,
  size: PLAYER_SIZE,
};

const INITIAL_P2: Player = {
  number: 2,
  position: vec2Subtract(SIM_SIZE, PLAYER_SIZE),
  velocity: VEC2_ZERO,
  size: PLAYER_SIZE,
};

export const SIMPLE_SIM_SETUP: Sim = {
  players: [INITIAL_P1, INITIAL_P2],
  size: SIM_SIZE,
  time: 0
};
