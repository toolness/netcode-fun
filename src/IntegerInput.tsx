import React, { useState } from 'react';
import { clamp } from './util';

function clampOrDefaultInt(value: string, min: number, max: number, defaultValue: number): number {
  const numValue = parseInt(value);
  if (isNaN(numValue)) {
    return defaultValue;
  }
  return clamp(numValue, min, max);
}

function focusPageOnEnterOrESC(e: React.KeyboardEvent) {
  if (e.keyCode === 13 || e.keyCode === 27) {
    e.preventDefault();
    document.documentElement.focus();
  }
}

export const IntegerInput: React.FC<{
  id: string,
  label: string,
  value: number,
  onChange: (value: number) => void,
  min: number,
  max: number
}> = (props) => {
  const [isEmpty, setIsEmpty] = useState(false);

  return <>
    <label htmlFor={props.id}>{props.label}:</label>{' '}
    <input
      type="number"
      pattern="\d*" /* Enable keypad on iOS. */
      value={isEmpty ? '' : props.value}
      min={props.min}
      max={props.max}
      onChange={(e) => {
        const { value } = e.target;
        if (value) {
          setIsEmpty(false);
          props.onChange(clampOrDefaultInt(e.target.value, props.min, props.max, props.value));
        } else {
          setIsEmpty(true);
        }
      }}
      onBlur={() => {
        if (isEmpty) {
          setIsEmpty(false);
        }
      }}
      onKeyDown={focusPageOnEnterOrESC}
    />
  </>
};
