"use client";
import { useEffect, useState } from "react";

export function useLocalStorageState<T>(initialState: T, key: string) {
  const [value, setValue] = useState<T | null>(initialState);

  useEffect(() => {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      setValue(JSON.parse(storedValue));
    }
  }, [key]);

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
