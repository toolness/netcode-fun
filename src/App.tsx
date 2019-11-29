import React, { useContext } from 'react';
import './App.css';
import { Player, Sim, SimViz } from './Sim';
import { Vec2, VEC2_ZERO, vec2Subtract } from "./Vec2";
import { InputManager, Button, InputContext, buttonName } from './InputManager';

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

const InputDisplay: React.FC<{button: Button}> = ({button}) => {
  const isDown = useContext(InputContext)[button];
  const visibility = isDown ? 'visible' : 'hidden';

  return <kbd style={{visibility}}>{buttonName(button)}</kbd>
};

const App: React.FC = () => {
  return (
    <InputManager>
      <div className="App">
        <div className="App-viewports">
          <div>
            <h2>Player 1</h2>
            <InputDisplay button="w"/>
            <InputDisplay button="a"/>
            <InputDisplay button="s"/>
            <InputDisplay button="d"/>
          </div>
          <div>
            <h2>Server</h2>
            <SimViz sim={INITIAL_SIM} />
          </div>
          <div>
            <h2>Player 2</h2>
            <InputDisplay button="arrowup"/>
            <InputDisplay button="arrowleft"/>
            <InputDisplay button="arrowdown"/>
            <InputDisplay button="arrowright"/>
          </div>
        </div>
      </div>
    </InputManager>
  );
}

export default App;
