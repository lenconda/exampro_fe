import AppRequestManager from '../../../../components/AppRequest/Manager';
import { User } from '../../../../interfaces';
import _ from 'lodash';

export const patchUserProfile = async (partialProfile: Partial<User>) => {
  const data = await AppRequestManager.send({
    url: '/user/profile',
    method: 'PATCH',
    data: partialProfile,
  });
  return _.get(data, 'data.data');
};
