import AppRequestManager from '../../../../../components/AppRequest/Manager';
import _ from 'lodash';

export const getRoles = async () => {
  const data = await AppRequestManager.send({
    url: '/admin/role?flatten=true',
  });
  return _.get(data, 'data.data');
};
