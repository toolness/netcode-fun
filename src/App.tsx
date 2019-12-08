import React, { useRef, useCallback, useState, useEffect } from 'react';
import './App.css';
import { MultiSimRunner } from './Sim';
import { Vec2, vec2Scale } from "./Vec2";
import { InputManager } from './InputManager';
import { Vec2Input } from './Vec2Input';
import { useInterval } from './timing';
import { IntegerInput } from './IntegerInput';
import { SimViz } from './SimViz';
import { SIMPLE_SIM_SETUP } from './simple-sim-setup';

const MIN_FPS = 1;
const MAX_FPS = 60;
const MIN_SPEED = 1;
const MAX_SPEED = 100;
const SPEED_SCALE = 0.1;

const App: React.FC = () => {
  const [playerSpeed, setPlayerSpeed] = useState(10);
  const [inputTickDelay, setInputTickDelay] = useState(3);
  const [networkTickDelay, setNetworkTickDelay] = useState(6);
  const [simFPS, setSimFPS] = useState(MAX_FPS);
  const sr = useRef(new MultiSimRunner(SIMPLE_SIM_SETUP, {inputTickDelay, networkTickDelay})).current;
  const [sim1, setSim1] = useState(sr.runners[0].currentState);
  const [sim2, setSim2] = useState(sr.runners[1].currentState);
  const fpsInterval = 1000 / simFPS;

  const movePlayer1 = useCallback((v: Vec2) => sr.setPlayerVelocity(0, vec2Scale(v, SPEED_SCALE * playerSpeed)), [sr, playerSpeed]);
  const movePlayer2 = useCallback((v: Vec2) => sr.setPlayerVelocity(1, vec2Scale(v, SPEED_SCALE * playerSpeed)), [sr, playerSpeed]);
  const nextTick = useCallback(() => {
    sr.tick();
    setSim1(sr.runners[0].currentState);
    setSim2(sr.runners[1].currentState);
  }, [sr]);

  useEffect(() => sr.setInputTickDelay(inputTickDelay), [inputTickDelay, sr]);
  useEffect(() => sr.setNetworkTickDelay(networkTickDelay), [networkTickDelay, sr]);
  useInterval(nextTick, fpsInterval);

  return (
    <InputManager>
      <div className="App">
        <div className="App-viewports">
          <div className="App-player-1">
            <h2>Player 1</h2>
            <SimViz sim={sim1} />
            <Vec2Input up="w" down="s" left="a" right="d" onChange={movePlayer1} />
          </div>
          <div className="App-config">
            <h2>Configuration</h2>
            <p>
              <IntegerInput id="fps" label="Simulation FPS" min={MIN_FPS} max={MAX_FPS} value={simFPS} onChange={setSimFPS} />
              <span className="App-desc">{fpsInterval.toFixed(0)}ms between frames</span>
            </p>
            <p>
              <IntegerInput id="itd" label="Input frame delay" min={0} max={100} value={inputTickDelay} onChange={setInputTickDelay} />
              <span className="App-desc">{(fpsInterval * inputTickDelay).toFixed(0)}ms before input affects simulation</span>
            </p>
            <p>
              <IntegerInput id="ntd" label="Network frame delay" min={0} max={100} value={networkTickDelay} onChange={setNetworkTickDelay} />
              <span className="App-desc">{(fpsInterval * networkTickDelay).toFixed(0)}ms of simulated network lag</span>
            </p>
            <p>
              <IntegerInput id="speed" label="Player speed" min={MIN_SPEED} max={MAX_SPEED} value={playerSpeed} onChange={setPlayerSpeed} />
            </p>
            <p className="App-desc">
              This is an exploration of delay and rollback-based netcode in a simulated network environment. For more details, please see the <a href="https://github.com/toolness/netcode-fun#readme" target="_blank" rel="noopener noreferrer">GitHub README</a>.
            </p>
          </div>
          <div className="App-player-2">
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
