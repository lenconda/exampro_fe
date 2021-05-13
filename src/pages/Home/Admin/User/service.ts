import { UserPaginationData } from '.';
import AppRequestManager from '../../../../components/AppRequest/Manager';
import {
  MenuItemRequestData,
  MenuItemResponseData,
  MenuRoleResponseData,
  MenuTreeItemLevelPermission,
  MenuTreeItemMetadata,
  User,
  UserRoleResponseData,
} from '../../../../interfaces';
import {
  pipeMenusResponseToFlattenedTree,
  pipeMenusResponseToTree,
} from '../../../../utils/pipes';
import { requestWithQueries } from '../../../../utils/request';
import _ from 'lodash';

export const queryAllUsers = async (queries: Record<string, any>) => {
  const data = await requestWithQueries<User>('/admin/user', queries);
  return data;
};

export const queryUserRoles = async (email: string, queries: Record<string, any>) => {
  const data = await requestWithQueries<UserRoleResponseData>(`/admin/user/${email}/role`, queries);
  return data;
};

export const deleteUserRoles = async (emails: string[], roleIds: string[]) => {
  const data = await AppRequestManager.send({
    url: '/admin/role/user',
    method: 'DELETE',
    data: {
      users: emails,
      roles: roleIds,
    },
  });
  return data;
};

export const grantUserRoles = async (emails: string[], roleIds: string[]) => {
  const data = await AppRequestManager.send({
    url: '/admin/role/user',
    method: 'POST',
    data: {
      users: emails,
      roles: roleIds,
    },
  });
  return data;
};
