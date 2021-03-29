import _ from 'lodash';
import { useEffect, useState } from 'react';

export type UseRequestReturnType<T> = [T, boolean, Error?];

export const useRequest = <T>(handler: (...args: any) => Promise<T>, args?: any[]): UseRequestReturnType<T> => {
  const [result, setResult] = useState<T>(undefined);
  const [error, setError] = useState<Error>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [flag, setFlag] = useState<boolean>(false);

  const check = (flag: boolean, handler?: Function, args?: any[]) => {
    if (!_.isFunction(handler) || flag) {
      return false;
    }
    if (!args || !_.isArray(args)) {
      console.log('FUCK');
      return true;
    }
    for (const arg of args) {
      if ((_.isObject(arg) && _.isEmpty(arg)) || !arg) {
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
