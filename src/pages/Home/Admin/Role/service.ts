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

export const createRole = async (roleId: string) => {
  const data = await AppRequestManager.send({
    url: '/admin/role',
    method: 'POST',
    data: { id: roleId },
  });
  return data;
};

export const deleteRole = async (regexString: string) => {
  const data = await AppRequestManager.send({
    url: '/admin/role',
    method: 'DELETE',
    data: {
      id: regexString,
    },
  });
  return data;
};
