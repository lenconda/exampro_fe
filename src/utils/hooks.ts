import { useCallback, useEffect, useRef, useState } from 'react';

export const useUpdateEffect = (callback: Function, inputs?: any[]) => {
  const isFirstEffect = useRef(true);

  useEffect(() => {
    if (isFirstEffect.current) {
      isFirstEffect.current = false;
      return;
    } else {
      callback.call(this, ...inputs);
    }
  }, [...inputs]);
};

export const useDebouncedValue = <T>(value: T, delay: number = 500) => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value]);

  return debouncedValue;
};

export function useFetchState<T>(initialState: T) {
  const focus = useRef<boolean>();
  const [state, setState] = useState<T>(initialState);

  useEffect(() => {
    focus.current = true;
    return () => {
      focus.current = false;
    };
  }, []);

  const setFetchState = useCallback((currentState) => {
    focus.current && setState(currentState);
  }, []);

  return [state, setFetchState];
}
