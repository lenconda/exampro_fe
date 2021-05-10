import AppRequestManager from '../../../../components/AppRequest/Manager';
import { ChangePasswordState, User } from '../../../../interfaces';
import _ from 'lodash';

export const patchUserProfile = async (partialProfile: Partial<User>) => {
  const data = await AppRequestManager.send({
    url: '/user/profile',
    method: 'PATCH',
    data: partialProfile,
    handleError: false,
  });
  return _.get(data, 'data.data');
};

export const patchUserPassword = async (updates: ChangePasswordState) => {
  const data = await AppRequestManager.send({
    url: '/user/password',
    method: 'PATCH',
    data: {
      ..._.pick(updates, ['old', 'new']),
    },
    handleError: false,
  });
  return _.get(data, 'data.data');
};
