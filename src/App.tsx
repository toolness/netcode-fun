import React, { useRef, useCallback, useState } from 'react';
import './App.css';
import { Player, Sim, MultiSimRunner, SimViz } from './Sim';
import { Vec2, VEC2_ZERO, vec2Subtract } from "./Vec2";
import { InputManager } from './InputManager';
import { Vec2Input } from './Vec2Input';
import { useInterval } from './timing';
import { clamp } from './util';

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

function clampOrDefaultInt(value: string, min: number, max: number, defaultValue: number): number {
  const numValue = parseInt(value);
  if (isNaN(numValue)) {
    return defaultValue;
  }
  return clamp(numValue, min, max);
}

const MIN_FPS = 1;
const MAX_FPS = 60;

const App: React.FC = () => {
  const inputTickDelay = 3;
  const networkTickDelay = 5;
  const [simFPS, setSimFPS] = useState(MAX_FPS);
  const sr = useRef(new MultiSimRunner(INITIAL_SIM, {inputTickDelay, networkTickDelay})).current;
  const [sim1, setSim1] = useState(sr.runners[0].currentState);
  const [sim2, setSim2] = useState(sr.runners[1].currentState);

  const movePlayer1 = useCallback((v: Vec2) => sr.setPlayerVelocity(0, v), [sr]);
  const movePlayer2 = useCallback((v: Vec2) => sr.setPlayerVelocity(1, v), [sr]);
  const nextTick = useCallback(() => {
    sr.tick();
    setSim1(sr.runners[0].currentState);
    setSim2(sr.runners[1].currentState);
  }, [sr]);

  useInterval(nextTick, 1000 / simFPS);

  return (
    <InputManager>
      <div className="App">
        <div className="App-viewports">
          <div>
            <h2>Player 1</h2>
            <SimViz sim={sim1} />
            <Vec2Input up="w" down="s" left="a" right="d" onChange={movePlayer1} />
          </div>
          <div>
            <h2>Configuration</h2>
            <p><label htmlFor="fps">Simulation FPS:</label> <input id="fps" type="number" value={simFPS} min={MIN_FPS} max={MAX_FPS} onChange={(e) => setSimFPS(clampOrDefaultInt(e.target.value, MIN_FPS, MAX_FPS, simFPS))} /></p>
            <p>Input frame delay: {inputTickDelay}</p>
            <p>Network frame delay: {networkTickDelay}</p>
          </div>
          <div>
            <h2>Player 2</h2>
            <SimViz sim={sim2} />
            <Vec2Input up="arrowup" down="arrowdown" left="arrowleft" right="arrowright" onChange={movePlayer2} />
          </div>
        </div>
      </div>
    </InputManager>
  );
}

export default App;
