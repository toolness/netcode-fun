import React from 'react';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <div className="App-viewports">
        <div>
          <h2>Player 1</h2>
        </div>
        <div>
          <h2>Server</h2>
        </div>
        <div>
          <h2>Player 2</h2>
        </div>
      </div>
    </div>
  );
}

export default App;
