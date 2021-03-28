import { History } from 'history';
import { useState, useEffect } from 'react';
import { patchedHistoryListener } from '../patches/history';
import qs from 'qs';
import _ from 'lodash';

type QSTypes = string | string[] | qs.ParsedQs | qs.ParsedQs[];

export const useAppPathname = (history: History) => {
  const [pathname, setPathname] = useState<string>(history.location.pathname);

  useEffect(() => {
    const destroy = history.listen(patchedHistoryListener((location) => {
      setPathname(location.pathname);
    }));
    return () => {
      destroy();
    };
  }, []);

  return pathname;
};

export const useLocationQuery = <T extends QSTypes>(
  history: History,
  key: string,
  transformer?: (value: any) => T,
) => {
  const [queryValue, setQueryValue] = useState<QSTypes>(undefined);

  useEffect(() => {
    const destroy = history.listen(patchedHistoryListener((location) => {
      const searchString = location.search.slice(1);
      const queries = qs.parse(searchString);
      const result = _.get(queries, key) || undefined;
      if (result && _.isFunction(transformer)) {
        setQueryValue(transformer.call(this, result));
      } else {
        setQueryValue(result);
      }
    }));
    return () => {
      destroy();
    };
  }, []);

  return queryValue;
};
