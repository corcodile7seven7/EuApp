import { useState, useEffect, useCallback, useRef } from 'react';

export function useTimer(initialSeconds, { onExpire, autoStart = false } = {}) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(autoStart);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!running || seconds <= 0) return;
    const id = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          setRunning(false);
          onExpireRef.current?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, seconds]);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback((newSeconds) => {
    setSeconds(newSeconds ?? initialSeconds);
    setRunning(false);
  }, [initialSeconds]);

  const pct = initialSeconds > 0 ? seconds / initialSeconds : 0;

  return { seconds, running, pct, start, pause, reset };
}
