import React from 'react';
import './Sim.css';
import { Vec2, vec2Equals, VEC2_ZERO, vec2Add } from './Vec2';
import { AspectRatio } from './AspectRatio';
import { memoryConservingMap, replaceArrayEntry, clamp, partitionArray } from './util';

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

export type SimRunnerOptions = {
  inputTickDelay: number,
  historyLength: number,
};

const DEFAULT_SIM_RUNNER_OPTIONS: SimRunnerOptions = {
  inputTickDelay: 0,
  historyLength: 1000
};

export type MultiSimRunnerOptions = SimRunnerOptions & {
  networkTickDelay: number
};

const DEFAULT_MULTI_SIM_RUNNER_OPTIONS: MultiSimRunnerOptions = {
  ...DEFAULT_SIM_RUNNER_OPTIONS,
  networkTickDelay: 1
};

export class MultiSimRunner {
  runners: SimRunner[] = [];
  options: MultiSimRunnerOptions;
  inTransitCommands: {ticksLeft: number, command: SimCommand}[] = [];

  constructor(initialState: Sim, options?: Partial<MultiSimRunnerOptions>) {
    this.options = {
      ...DEFAULT_MULTI_SIM_RUNNER_OPTIONS,
      ...options
    };
    for (let i = 0; i < initialState.players.length; i++) {
      this.runners.push(new SimRunner(initialState, options));
    }
  }

  setInputTickDelay(value: number) {
    this.runners.forEach(r => { r.options.inputTickDelay = value; });
  }

  setNetworkTickDelay(value: number) {
    this.options.networkTickDelay = value;
  }

  tick() {
    this.inTransitCommands = this.inTransitCommands.filter(itc => {
      if (itc.ticksLeft === 0) {
        this.runners.forEach((runner, playerIndex) => {
          if (playerIndex !== itc.command.playerIndex) {
            runner.queuedCommands.push(itc.command);
          }
        });
        return false;
      }
      itc.ticksLeft--;
      return true;
    });
    this.runners.forEach(r => r.tick());
  }

  setPlayerVelocity(playerIndex: number, velocity: Vec2) {
    const command = this.runners[playerIndex].setPlayerVelocity(playerIndex, velocity);
    this.inTransitCommands.push({ticksLeft: this.options.networkTickDelay, command});
  }
}

function partitionCommands(commands: SimCommand[], time: number): [SimCommand[], SimCommand[], SimCommand[]] {
  const past: SimCommand[] = [];
  const present: SimCommand[] = [];
  const future: SimCommand[] = [];

  commands.forEach(command => {
    if (command.time < time) {
      past.push(command);
    } else if (command.time > time) {
      future.push(command);
    } else {
      present.push(command);
    }
  });

  return [past, present, future];
}

function executeHistoryEntry({state, commands}: SimHistoryEntry): Sim {
  commands.forEach(command => { state = applySimCommand(state, command); });
  state = nextSimState(state, 1);
  return state;
}

function partitionCommandsByTime(commands: SimCommand[]): SimCommand[][] {
  const result: SimCommand[][] = [];

  while (commands.length > 0) {
    const time = commands[0].time;
    const [cmdsForTime, rest] = partitionArray(commands, cmd => cmd.time === time);
    result.push(cmdsForTime);
    commands = rest;
  }

  return result;
}

type SimHistoryEntry = {
  state: Sim;
  commands: SimCommand[]
};

export class SimRunner {
  currentState: Sim;
  history: SimHistoryEntry[] = [];
  options: SimRunnerOptions;
  queuedCommands: SimCommand[] = [];

  constructor(readonly initialState: Sim, options?: Partial<SimRunnerOptions>) {
    this.options = {
      ...DEFAULT_SIM_RUNNER_OPTIONS,
      ...options
    };
    this.currentState = initialState;
  }

  private addToHistory(entry: SimHistoryEntry): SimHistoryEntry {
    this.history.push(entry);
    const entriesToDelete = this.history.length - this.options.historyLength;
    if (entriesToDelete > 0) {
      this.history.splice(0, entriesToDelete);
    }
    return entry;
  }

  private getHistoryIndexForTime(time: number) {
    const now = this.currentState.time;
    const index = this.history.length - (now - time);
    if (index < 0) {
      throw new Error(`History is not long enough for time ${time}!`);
    }
    if (index >= this.history.length) {
      throw new Error(`Time ${time} is in the present or future, not the past!`);
    }
    return index;
  }

  private rollbackAndApplyCommands(commands: SimCommand[]) {
    const time = commands[0].time;
    const start = this.getHistoryIndexForTime(time);
    this.history[start].commands.push(...commands);
    for (let i = start; i < this.history.length; i++) {
      const state = executeHistoryEntry(this.history[i]);
      const nextI = i + 1;
      if (nextI < this.history.length) {
        this.history[nextI].state = state;
      } else {
        this.currentState = state;
      }
    }
  }

  getStateAtTime(time: number): Sim {
    if (time === this.currentState.time) return this.currentState;
    return this.history[this.getHistoryIndexForTime(time)].state;
  }

  tick() {
    const [past, present, future] = partitionCommands(this.queuedCommands, this.currentState.time);
    this.queuedCommands = future;
    partitionCommandsByTime(past).forEach(cmds => this.rollbackAndApplyCommands(cmds));
    this.currentState = executeHistoryEntry(this.addToHistory({
      state: this.currentState,
      commands: present
    }));
  }

  setPlayerVelocity(playerIndex: number, velocity: Vec2): SimCommand {
    const cmd: SimCommand = {
      type: 'set-velocity',
      time: this.currentState.time + this.options.inputTickDelay,
      playerIndex,
      velocity
    };
    this.queuedCommands.push(cmd);
    return cmd;
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
