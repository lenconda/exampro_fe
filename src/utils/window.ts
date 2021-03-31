import { useEffect, useState } from 'react';

export const useWindowInnerSizes = () => {
  const [innerHeight, setInnerHeight] = useState<number>(window.innerHeight);
  const [innerWidth, setInnerWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    const handler = (event: UIEvent) => {
      setInnerHeight(window.innerHeight);
      setInnerWidth(window.innerWidth);
    };
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('resize', handler);
    };
  }, []);

  return [innerWidth, innerHeight];
};
