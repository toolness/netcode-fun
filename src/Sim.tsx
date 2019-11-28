import React from 'react';
import './Sim.css';

export const VEC2_ZERO: Vec2 = {x: 0, y: 0};

export interface Vec2 {
  x: number;
  y: number;
}

export interface Player {
  number: number;
  position: Vec2;
  velocity: Vec2;
  size: Vec2;
}

export interface Sim {
  players: Player[];
  size: Vec2;
  time: number;
}

export function vec2Equals(a: Vec2, b: Vec2): boolean {
  return a.x === b.x && a.y === b.y;
};

export function addVec2(a: Vec2, b: Vec2): Vec2 {
  return {x: a.x + b.x, y: a.y + b.y};
}

export function subtractVec2(a: Vec2, b: Vec2): Vec2 {
  return addVec2(a, scaleVec2(b, -1));
}

export function scaleVec2(v: Vec2, amount: number): Vec2 {
  return {x: amount * v.x, y: amount * v.y};
}

function nextPlayerState(p: Player): Player {
  if (vec2Equals(p.velocity, VEC2_ZERO)) {
    return p;
  }
  return {
    ...p,
    position: addVec2(p.position, p.velocity)
  };
}

function memoryConservingMap<T>(arr: T[], mapFn: (item: T) => T): T[] {
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

export function nextSimState(s: Sim): Sim {
  return {
    ...s,
    players: memoryConservingMap(s.players, nextPlayerState),
    time: s.time + 1
  };
}

export const PlayerViz: React.FC<{player: Player}> = (props) => {
  return (
    <div className="Player-viz">player #{props.player.number}</div>
  );
};

export const SimViz: React.FC<{sim: Sim}> = (props) => {
  return (
    <div className="Sim-viz">
      {props.sim.players.map(player => <PlayerViz player={player} />)}
    </div>
  );
};
