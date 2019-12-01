import React, { useState, useEffect } from 'react';

const USE_CAPTURE = true;

export type Button = 'w'|'a'|'s'|'d'|'arrowup'|'arrowdown'|'arrowleft'|'arrowright';

export type ButtonState = {
  [K in Button]?: boolean
};

export const InputContext = React.createContext<ButtonState>({});

export const InputManager: React.FC = props => {
  const [state, setState] = useState<ButtonState>({});

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (document.activeElement && document.activeElement.nodeName === 'INPUT') return;

      const isDown = e.type === 'keydown';

      setState(prevState => ({
        ...prevState,
        [e.key.toLowerCase()]: isDown
      }));
    };

    window.addEventListener('keydown', listener, USE_CAPTURE);
    window.addEventListener('keyup', listener, USE_CAPTURE);

    return () => {
      window.removeEventListener('keydown', listener, USE_CAPTURE);
      window.removeEventListener('keyup', listener, USE_CAPTURE);
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
