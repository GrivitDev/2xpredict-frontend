// hooks/useExchangeRate.ts

import { useEffect, useState } from 'react';

interface UseExchangeRateResult {
  rate: number;
  loading: boolean;
  error: boolean;
}

export function useExchangeRate(): UseExchangeRateResult {
  const [rate, setRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchRate() {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(
          'https://api.frankfurter.dev/v2/rate/USD/NGN',
        );

        if (!response.ok) {
          throw new Error();
        }

        const data = await response.json();

        if (!cancelled) {
          setRate(data.rate);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchRate();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    rate,
    loading,
    error,
  };
}