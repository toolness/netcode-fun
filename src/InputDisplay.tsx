import React, { useContext } from 'react';
import { Button, InputContext, buttonName } from './InputManager';

export const InputDisplay: React.FC<{
  button: Button;
}> = ({ button }) => {
  const input = useContext(InputContext);
  const isDown = input.buttons[button];
  const opacity = isDown ? 1.0 : 0.66;
  const simulate = (isDown: boolean, e: React.SyntheticEvent) => {
    e.preventDefault();
    input.setButton(button, isDown);
  };
  const simulateDown = simulate.bind(null, true);
  const simulateUp = simulate.bind(null, false);
  return (
    <kbd
      style={{ opacity, cursor: 'pointer' }}
      onMouseDown={simulateDown}
      onMouseUp={simulateUp}
      onTouchStart={simulateDown}
      onTouchEnd={simulateUp}
    >
      {buttonName(button)}
    </kbd>
  );
};
