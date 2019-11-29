import React from 'react';
import './App.css';
import { Player, Sim, SimViz } from './Sim';
import { Vec2, VEC2_ZERO, vec2Subtract } from "./Vec2";

const PLAYER_SIZE: Vec2 = {x: 10, y: 10};
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
  return (
    <div className="App">
      <div className="App-viewports">
        <div>
          <h2>Player 1</h2>
        </div>
        <div>
          <h2>Server</h2>
          <SimViz sim={INITIAL_SIM} />
        </div>
        <div>
          <h2>Player 2</h2>
        </div>
      </div>
    </div>
  );
}

export default App;
