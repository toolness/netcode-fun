import React, { useState, useEffect } from 'react';

export type Button = 'w'|'a'|'s'|'d'|'arrowup'|'arrowdown'|'arrowleft'|'arrowright';

export type ButtonState = {
  [K in Button]?: boolean
};

export const InputContext = React.createContext<ButtonState>({});

export const InputManager: React.FC = props => {
  const [state, setState] = useState<ButtonState>({});

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      const isDown = e.type === 'keydown';

      setState(prevState => ({
        ...prevState,
        [e.key.toLowerCase()]: isDown
      }));
    };

    window.addEventListener('keydown', listener, true);
    window.addEventListener('keyup', listener, true);

    return () => {
      window.removeEventListener('keydown', listener, true);
      window.removeEventListener('keyup', listener, true);
    };
  }, []);

  return <InputContext.Provider value={state} {...props} />;
};

export function buttonName(button: Button): string {
  switch (button) {
    case 'arrowup': return '↑';
    case 'arrowdown': return '↓';
    case 'arrowleft': return '←';
    case 'arrowright': return '→';
  }

  return button.toUpperCase();
}
