import { useEffect, useState } from "react";

export function useLocalStorageState<T>(initialState: T, key: string) {
  const [value, setValue] = useState<T | null>(() => {
    // Synchronous read on first render — no effect lag
    if (typeof window === "undefined") return initialState;
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : initialState;
  });

  // Remove the first useEffect entirely — no longer needed

  useEffect(
    function () {
      if (value === null || value === undefined) {
        return localStorage.removeItem(key);
      }
      localStorage.setItem(key, JSON.stringify(value));
    },
    [value, key],
  );

  const remove = () => {
    setValue(null);
  };

  return [value, setValue, remove] as const;
}
