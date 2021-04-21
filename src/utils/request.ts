import { useLocationQuery } from './history';
import { PaginationResponse } from '../interfaces';
import _ from 'lodash';
import qs from 'qs';
import { useEffect, useState } from 'react';

export type UseRequestReturnType<T> = [T, boolean, Error?, Function?];
export type UsePaginationRequestReturnType<T> = [T[], number, boolean, number, number, string?, Error?, Function?];

export const useRequest = <T>(
  handler: (...args: any) => Promise<T>,
  args?: any[],
): UseRequestReturnType<T> => {
  const [result, setResult] = useState<T>(undefined);
  const [error, setError] = useState<Error>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [flag, setFlag] = useState<boolean>(false);
  const [refreshCount, setRefreshCount] = useState<number>(0);

  const check = (flag: boolean, handler?: Function, args?: any[]) => {
    if (!_.isFunction(handler) || flag) {
      return false;
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
    if (check(flag, handler, args)) {
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
        size,
        search,
        last_cursor: lastCursor,
        ...queries,
      }));
    } else {
      setSearchString(qs.stringify({
        page,
        size,
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
    if ((previousSearchString !== searchString || previousRefreshCount !== refreshCount) && _.isFunction(handler)) {
      setLoading(true);
      handler(searchString).then((data) => {
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
  }, [searchString, previousSearchString, refreshCount]);

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
