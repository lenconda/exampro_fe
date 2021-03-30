import { useEffect, useRef } from 'react';

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
