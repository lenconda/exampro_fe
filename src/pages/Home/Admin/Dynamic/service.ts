import AppRequestManager from '../../../../components/AppRequest/Manager';
import {
  DynamicConfig,
} from '../../../../interfaces';
import { requestWithQueries } from '../../../../utils/request';
import _ from 'lodash';

export const queryAllDynamicConfigs = async (queries: Record<string, any>) => {
  const data = await requestWithQueries<DynamicConfig>('/admin/dynamic', queries);
  return data;
};

export const deleteDynamicConfigs = async (ids: number[]) => {
  const data = await AppRequestManager.send({
    url: '/admin/dynamic',
    method: 'DELETE',
    data: {
      configs: ids,
    },
  });
  return data;
};

export const updateDynamicConfig = async (id: number, updates: Partial<DynamicConfig>) => {
  const data = await AppRequestManager.send({
    url: `/admin/dynamic/${id}`,
    method: 'PATCH',
    data: updates,
  });
  return data;
};

export const createDynamicConfig = async (config: Partial<DynamicConfig>) => {
  const data = await AppRequestManager.send({
    url: '/admin/dynamic',
    method: 'POST',
    data: config,
  });

  return _.get(data, 'data.data');
};
