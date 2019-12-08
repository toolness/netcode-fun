import React from 'react';
import './App.css';
import { InputManager } from './InputManager';
import Testbed from './Testbed';
import { Client } from './Client';

const App: React.FC<{search?: string}> = props => {
  const search = new URLSearchParams(props.search || window.location.search);
  const room = search.get('room');
  const playerIndex = parseInt(search.get('p') || '0');

  return (
    <InputManager>
      <div className="App">
        {room && !isNaN(playerIndex) ? <Client {...{room, playerIndex}} /> : <Testbed />}
      </div>
    </InputManager>
  );
}

export default App;
