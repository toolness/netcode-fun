import React, { useContext, useEffect, useState, useRef } from 'react';
import { Button, InputContext } from './InputManager';
import { Vec2 } from './Vec2';

function getAxis(positive: boolean, negative: boolean): number {
  if (positive && negative) return 0;
  if (!positive && !negative) return 0;
  if (positive) return 1.0;
  return -1.0;
}

// https://stackoverflow.com/a/53446665
function usePrevious<T>(value: T): T|undefined {
  const ref = useRef<T|undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

export const Vec2Input: React.FC<{
  up: Button,
  down: Button,
  left: Button,
  right: Button,
  onChange: (velocity: Vec2) => void
}> = (props) => {
  const { onChange } = props;
  const {
    [props.up]: up,
    [props.down]: down,
  } = useContext(InputContext);

  const [yVel, setYVel] = useState(getAxis(!!down, !!up));
  const prevYVel = usePrevious(yVel);

  useEffect(() => setYVel(getAxis(!!down, !!up)), [up, down]);
  useEffect(() => {
    if (yVel !== prevYVel) {
      onChange({x: 0.0, y: yVel});
    }
  }, [yVel, prevYVel, onChange]);

  return null;  
};
