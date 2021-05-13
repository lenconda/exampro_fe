import AppRequestManager from '../../../../components/AppRequest/Manager';
import {
  RoleResponseData,
  RoleTreeItemResponseData,
} from '../../../../interfaces';
import _ from 'lodash';

export const getRoles = async () => {
  const data = await AppRequestManager.send({
    url: '/admin/role',
  });
  return _.get(data, 'data.data') as RoleResponseData[];
};
