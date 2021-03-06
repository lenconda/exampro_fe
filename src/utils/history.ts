import { patchedHistoryListener } from '../patches/history';
import { History } from 'history';
import { useState, useEffect } from 'react';
import qs from 'qs';
import _ from 'lodash';
import { useHistory } from 'react-router';

type QSTypes = string | string[] | qs.ParsedQs | qs.ParsedQs[];

export const useAppPathname = () => {
  const history = useHistory();
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
  key: string,
  transformer?: (value: any) => T,
) => {
  const getQuery = (search: string) => {
    const searchString = search.slice(1);
    const queries = qs.parse(searchString);
    const result = _.get(queries, key) || undefined;
    return result;
  };

  const history = useHistory();
  const [queryValue, setQueryValue] = useState<QSTypes>(getQuery(window.location.search) || getQuery(history.location.search));

  useEffect(() => {
    const destroy = history.listen(patchedHistoryListener((location) => {
      const result = getQuery(location.search);
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

export const pushSearch = (history: History, queries: Record<string, any>) => {
  const search = (_.get(history, 'location.search') || '').slice(1);
  const parsedQueries = qs.parse(search);
  const newQueries = {
    ...parsedQueries,
    ...queries,
  };
  const stringifiedSearchString = qs.stringify(newQueries);
  return stringifiedSearchString ? `?${stringifiedSearchString}` : '';
};
