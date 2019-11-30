import { useEffect, useRef } from 'react';

export function useRequestAnimationFrame(fn: () => void) {
  const animRef = useRef(-1);
  useEffect(() => {
    const animate = () => {
      fn();
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [fn]);
}

export function useInterval(fn: () => void, ms: number) {
  const intervalRef = useRef(-1);

  useEffect(() => {
    intervalRef.current = window.setInterval(fn, ms);
    return () => {
      window.clearInterval(intervalRef.current);
    };
  }, [fn, ms]);
}
