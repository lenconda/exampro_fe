import _ from 'lodash';
import AppRequestManager from '../../components/AppRequest/Manager';

export const getUserProfile = async () => {
  const data = await AppRequestManager.send({
    url: '/user/profile',
  });
  return _.get(data, 'data.data');
};
