import { useLocationQuery } from './history';
import { PaginationResponse } from '../interfaces';
import AppRequestManager from '../components/AppRequest/Manager';
import _ from 'lodash';
import qs from 'qs';
import { useEffect, useState } from 'react';

export type UseRequestReturnType<T> = [T, boolean, Error?, Function?];
export type UsePaginationRequestReturnType<T> = [T[], number, boolean, number, number, string?, Error?, Function?];

export const useRequest = <T>(
  handler: (...args: any) => Promise<T>,
  args?: any[],
  onlyOnce: boolean = true,
): UseRequestReturnType<T> => {
  const [result, setResult] = useState<T>(undefined);
  const [error, setError] = useState<Error>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [flag, setFlag] = useState<boolean>(false);
  const [refreshCount, setRefreshCount] = useState<number>(0);

  const check = (flag: boolean, handler?: Function, args?: any[], onlyOnce?: boolean) => {
    if (!_.isFunction(handler)) {
      return false;
    }
    if (flag) {
      return !onlyOnce;
    }
    if (!args || !_.isArray(args)) {
      return true;
    }
    for (const arg of args) {
      if ((_.isObject(arg) && _.isEmpty(arg)) || (!_.isNumber(arg) && !arg)) {
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    if (check(flag, handler, args, onlyOnce)) {
      setFlag(true);
      const currentArgs = args || [];
      setLoading(true);
      handler(...currentArgs).then((data) => {
        if (data) {
          setResult(data);
        }
      }).catch((error) => setError(error)).finally(() => setLoading(false));
    }
  }, [handler, args, flag, refreshCount]);

  const refresh = () => {
    setRefreshCount(refreshCount + 1);
  };

  return [result, loading, error, refresh];
};

export const usePaginationRequest = <T>(
  handler: (...args: any) => Promise<PaginationResponse<T>>,
  queries?: Record<string, string>,
  emptyMode: boolean = true,
): UsePaginationRequestReturnType<T> => {
  const page = useLocationQuery('page');
  const size = useLocationQuery('size');
  const search = useLocationQuery('search');
  const lastCursor = useLocationQuery('last_cursor');
  const [searchString, setSearchString] = useState<string>('');
  const [previousSearchString, setPreviousSearchString] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>(undefined);
  const [result, setResult] = useState<PaginationResponse<T>>(undefined);
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [refreshCount, setRefreshCount] = useState<number>(0);
  const [previousRefreshCount, setPreviousRefreshCount] = useState<number>(0);
  const [currentHandler, setCurrentHandler] = useState<Function>(undefined);

  useEffect(() => {
    if (_.isFunction(handler) && !_.isFunction(currentHandler)) {
      setCurrentHandler(() => handler);
    }
  }, [handler]);

  useEffect(() => {
    if (!emptyMode) {
      const queryKeys = Object.keys(queries);
      for (const key of queryKeys) {
        if (!queries[key]) {
          return;
        }
      }
    }
    if (lastCursor) {
      setSearchString(qs.stringify({
        size: size || 10,
        search,
        last_cursor: lastCursor,
        ...queries,
      }));
    } else {
      setSearchString(qs.stringify({
        page: page || 1,
        size: size || 10,
        search,
        ...queries,
      }));
    }
  }, [queries]);

  useEffect(() => {
    if (result) {
      if (lastCursor) {
        setItems(items.concat(result.items || []));
      } else {
        setItems(result.items || []);
      }
      setTotal(result.total || 0);
    }
  }, [result]);

  useEffect(() => {
    if (
      (previousSearchString !== searchString || previousRefreshCount !== refreshCount)
      && _.isFunction(currentHandler)
    ) {
      setLoading(true);
      currentHandler(searchString).then((data) => {
        if (data) {
          setResult(data);
        }
      }).catch((error) => {
        setError(error);
      }).finally(() => {
        setLoading(false);
        setPreviousSearchString(searchString);
        setPreviousRefreshCount(refreshCount);
      });
    }
  }, [searchString, previousSearchString, refreshCount, previousRefreshCount, currentHandler]);

  const refresh = () => {
    setRefreshCount(refreshCount + 1);
  };

  return [
    items,
    total,
    loading,
    parseInt((page as string) || '1', 10),
    parseInt((size as string) || '10', 10),
    (lastCursor as string),
    error,
    refresh,
  ];
};

export const requestWithQueries = async <T>(url: string, queries: Record<string, any>): Promise<PaginationResponse<T>> => {
  const [originalPathname, originalSearch = ''] = url.split('?');
  if (!originalPathname) {
    return {
      items: [],
      total: 0,
    };
  }
  const originalQueries = qs.parse(originalSearch);
  const currentQueries = {
    ...originalQueries,
    ...queries,
  };
  const data = await AppRequestManager.send({
    url: `${originalPathname}?${qs.stringify(currentQueries)}`,
  });
  return _.get(data, 'data.data');
};
