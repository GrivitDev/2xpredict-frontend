import { useEffect, useState } from 'react';

export function usePredictionCountdown(
  releaseAt?: number,
  released?: boolean,
) {
  const calculate = () => {
    if (!releaseAt) {
      return {
        released: false,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    if (released || Date.now() >= releaseAt) {
      return {
        released: true,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    const diff = releaseAt - Date.now();

    return {
      released: false,
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  const [time, setTime] = useState(calculate);

  useEffect(() => {
    setTime(calculate());

    const timer = setInterval(() => {
      setTime(calculate());
    }, 1000);

    return () => clearInterval(timer);
  }, [releaseAt, released]);

  return time;
}