import React from 'react';
import './Sim.css';
import { Vec2, vec2Equals, VEC2_ZERO, vec2Add } from './Vec2';
import { AspectRatio } from './AspectRatio';
import { memoryConservingMap, replaceArrayEntry, clamp } from './util';

export type SetPlayerVelocityCommand = {
  type: 'set-velocity';
  time: number;
  playerIndex: number;
  velocity: Vec2;
};

export type SimCommand = SetPlayerVelocityCommand;

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

export function nextPlayerState(p: Player, sim: Sim, ticks: number): Player {
  if (vec2Equals(p.velocity, VEC2_ZERO)) {
    return p;
  }
  const next: Player = {...p};
  for (let i = 0; i < ticks; i++) {
    next.position = vec2Add(next.position, p.velocity);
  }
  next.position.x = clamp(next.position.x, 0, sim.size.x - p.size.x);
  next.position.y = clamp(next.position.y, 0, sim.size.y - p.size.y);
  return next;
}

export function nextSimState(s: Sim, ticks: number = 1): Sim {
  return {
    ...s,
    players: memoryConservingMap(s.players, p => nextPlayerState(p, s, ticks)),
    time: s.time + ticks
  };
}

export function applySimCommand(s: Sim, command: SimCommand): Sim {
  if (command.time !== s.time) {
    throw new Error(`We can only apply commands made at the same time as the sim right now`);
  }
  switch (command.type) {
    case 'set-velocity':
      return {
        ...s,
        players: replaceArrayEntry(s.players, command.playerIndex, {
          ...s.players[command.playerIndex],
          velocity: command.velocity
        })
      };
  }
}

export class SimRunner {
  currentState: Sim;
  queuedCommands: SimCommand[] = [];

  constructor(readonly initialState: Sim) {
    this.currentState = initialState;
  }

  tick() {
    const commands = this.queuedCommands;
    let state = this.currentState;
    commands.forEach(command => {
      state = applySimCommand(state, command);
    });
    state = nextSimState(state, 1);
    this.queuedCommands = [];
    this.currentState = state;
  }

  setPlayerVelocity(playerIndex: number, velocity: Vec2) {
    this.queuedCommands.push({
      type: 'set-velocity',
      time: this.currentState.time,
      playerIndex,
      velocity
    });
  }
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
