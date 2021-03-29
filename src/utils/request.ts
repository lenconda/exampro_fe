import _ from 'lodash';
import qs from 'qs';
import { useEffect, useState } from 'react';
import { PaginationResponse } from '../interfaces';
import { useLocationQuery } from './history';

export type UseRequestReturnType<T> = [T, boolean, Error?];
export type UsePaginationRequestReturnType<T> = [T[], number, boolean, Error?];

export const useRequest = <T>(
  handler: (...args: any) => Promise<T>,
  args?: any[],
): UseRequestReturnType<T> => {
  const [result, setResult] = useState<T>(undefined);
  const [error, setError] = useState<Error>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [flag, setFlag] = useState<boolean>(false);

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
  }, [handler, args, flag]);

  return [result, loading, error];
};

export const usePaginationRequest = <T>(
  handler: (...args: any) => Promise<PaginationResponse<T>>,
  queries?: Record<string, string>,
): UsePaginationRequestReturnType<T> => {
  const page = useLocationQuery('page');
  const size = useLocationQuery('size');
  const search = useLocationQuery('search');
  const lastCursor = useLocationQuery('last_cursor');
  const searchString = qs.stringify({
    page,
    size,
    search,
    last_cursor: lastCursor,
    ...queries,
  });
  const [result, loading, error] = useRequest<PaginationResponse<T>>(handler, searchString ? [searchString] : null);
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    if (result) {
      setItems(result.items || []);
      setTotal(result.total || 0);
    }
  }, [result]);

  return [items, total, loading, error];
};
