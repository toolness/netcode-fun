import React from 'react';
import './Sim.css';
import { Vec2, vec2Equals, VEC2_ZERO, vec2Add } from './Vec2';
import { AspectRatio } from './AspectRatio';
import { memoryConservingMap } from './util';

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

export function nextSimState(s: Sim): Sim {
  return {
    ...s,
    players: memoryConservingMap(s.players, nextPlayerState),
    time: s.time + 1
  };
}

export const PlayerViz: React.FC<{player: Player, sim: Sim}> = ({player, sim}) => {
  return (
    <div className={`Player-viz Player-number-${player.number}`} title={`Player ${player.number}`} style={{
      width: `${player.size.x / sim.size.x * 100}%`,
      top: `${player.position.y / sim.size.y * 100}%`,
      left: `${player.position.x / sim.size.x * 100}%`,
    }}>
      <AspectRatio width={player.size.x} height={player.size.y} />
    </div>
  );
};

export const SimViz: React.FC<{sim: Sim}> = ({sim}) => {
  return (
    <AspectRatio className="Sim-viz" width={sim.size.x} height={sim.size.y}>
      {sim.players.map(player => <PlayerViz key={player.number} player={player} sim={sim} />)}
    </AspectRatio>
  );
};
