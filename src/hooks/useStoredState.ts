import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export function useStoredState<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        setValue(JSON.parse(stored) as T);
      }
    } catch {
      setValue(initialValue);
    } finally {
      setHasHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (typeof window === 'undefined' || !hasHydrated) return;
    localStorage.setItem(key, JSON.stringify(value));
  }, [hasHydrated, key, value]);

  return [value, setValue];
}
