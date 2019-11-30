import React, { useContext } from 'react';
import { Button, InputContext, buttonName } from './InputManager';

export const InputDisplay: React.FC<{
  button: Button;
}> = ({ button }) => {
  const isDown = useContext(InputContext)[button];
  const opacity = isDown ? 1.0 : 0.66;
  return <kbd style={{ opacity }}>{buttonName(button)}</kbd>;
};
