import React, { useContext, useEffect, useState, useRef } from 'react';
import { Button, InputContext } from './InputManager';
import { Vec2 } from './Vec2';
import { InputDisplay } from './InputDisplay';

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

function useAxis(positiveBtn: Button, negativeBtn: Button): [number, number|undefined] {
  const {[positiveBtn]: positive, [negativeBtn]: negative} = useContext(InputContext);
  const [value, setValue] = useState(getAxis(!!positive, !!negative));
  const prevValue = usePrevious(value);

  useEffect(() => setValue(getAxis(!!positive, !!negative)), [positive, negative]);

  return [value, prevValue];
}

export const Vec2Input: React.FC<{
  up: Button,
  down: Button,
  left: Button,
  right: Button,
  onChange: (velocity: Vec2) => void
}> = (props) => {
  const { onChange } = props;
  const [xVel, prevXVel] = useAxis(props.right, props.left);
  const [yVel, prevYVel] = useAxis(props.down, props.up);

  useEffect(() => {
    if (yVel !== prevYVel || xVel !== prevXVel) {
      onChange({x: xVel, y: yVel});
    }
  }, [xVel, prevXVel, yVel, prevYVel, onChange]);

  return (
    <div>
      <div><InputDisplay button={props.up} /></div>
      <div>
        <InputDisplay button={props.left} />
        <InputDisplay button={props.down} />
        <InputDisplay button={props.right} />
      </div>
    </div>
  );
};
