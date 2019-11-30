import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import { Player, Sim, SimViz, nextSimState, applySimCommand } from './Sim';
import { Vec2, VEC2_ZERO, vec2Subtract } from "./Vec2";
import { InputManager } from './InputManager';
import { Vec2Input } from './Vec2Input';

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

const INITIAL_SIM: Sim = {
  players: [INITIAL_P1, INITIAL_P2],
  size: SIM_SIZE,
  time: 0
};

const App: React.FC = () => {
  const [sim, setSim] = useState(INITIAL_SIM);
  const animRef = useRef(-1);

  const animate = () => {
    setSim(sim => nextSimState(sim));
    animRef.current = requestAnimationFrame(animate);
  };

  const movePlayer = (playerIndex: number, velocity: Vec2) => {
    setSim(sim => applySimCommand(sim, {
      type: 'set-velocity',
      time: sim.time,
      playerIndex,
      velocity
    }));
  };

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  });

  return (
    <InputManager>
      <div className="App">
        <div className="App-viewports">
          <div>
            <h2>Player 1</h2>
            <Vec2Input up="w" down="s" left="a" right="d" onChange={v => movePlayer(0, v)} />
          </div>
          <div>
            <h2>Server</h2>
            <SimViz sim={sim} />
          </div>
          <div>
            <h2>Player 2</h2>
            <Vec2Input up="arrowup" down="arrowdown" left="arrowleft" right="arrowright" onChange={v => movePlayer(1, v)} />
          </div>
        </div>
      </div>
    </InputManager>
  );
}

export default App;
