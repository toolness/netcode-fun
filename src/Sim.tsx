import React from 'react';
import './Sim.css';
import { Vec2, vec2Equals, VEC2_ZERO, vec2Add } from './Vec2';

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

function nextPlayerState(p: Player): Player {
  if (vec2Equals(p.velocity, VEC2_ZERO)) {
    return p;
  }
  return {
    ...p,
    position: vec2Add(p.position, p.velocity)
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
