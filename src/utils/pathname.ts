import { History } from 'history';
import React, { useState } from 'react';

export const useAppPathname = (history: History) => {
  const [pathname, setPathname] = useState(history.location.pathname);

  React.useEffect(() => {
    const destroy = history.listen((data: any) => {
      setPathname(data.pathname);
    });
    return () => {
      destroy();
    };
  }, []);

  return pathname;
};
