import _ from 'lodash';
import qs from 'qs';

export const getQuery = (search: string = '', key: string): string => {
  const queries = qs.parse(search.slice(1)) as Record<string, any>;
  return _.get(queries, key) || undefined;
};
