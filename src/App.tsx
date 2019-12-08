import React from 'react';
import './App.css';
import { InputManager } from './InputManager';
import Testbed from './Testbed';

const App: React.FC = () => {
  return (
    <InputManager>
      <div className="App">
        <Testbed />
      </div>
    </InputManager>
  );
}

export default App;
