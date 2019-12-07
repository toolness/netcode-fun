import React, { useState, useEffect } from 'react';

const USE_CAPTURE = true;

export type Button = 'w'|'a'|'s'|'d'|'arrowup'|'arrowdown'|'arrowleft'|'arrowright';

export type ButtonState = {
  [K in Button]?: boolean
};

type ButtonSetter = (button: Button, isDown: boolean) => void;

export type InputContextType = {
  buttons: ButtonState,
  setButton: ButtonSetter,
};

export const InputContext = React.createContext<InputContextType>({
  buttons: {},
  setButton: () => {},
});

export const InputManager: React.FC = props => {
  const [buttons, setButtons] = useState<ButtonState>({});

  const setButton: ButtonSetter = (button, isDown) => {
    setButtons(prevButtons => ({
      ...prevButtons,
      [button]: isDown
    }));
  };

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (document.activeElement && document.activeElement.nodeName === 'INPUT') return;

      const isDown = e.type === 'keydown';

      setButton(e.key.toLowerCase() as Button, isDown);
    };

    window.addEventListener('keydown', listener, USE_CAPTURE);
    window.addEventListener('keyup', listener, USE_CAPTURE);

    return () => {
      window.removeEventListener('keydown', listener, USE_CAPTURE);
      window.removeEventListener('keyup', listener, USE_CAPTURE);
    };
  }, []);

  return <InputContext.Provider value={{buttons, setButton}} {...props} />;
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
