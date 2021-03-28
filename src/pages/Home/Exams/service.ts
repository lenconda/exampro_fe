import _ from 'lodash';
import AppRequestManager from '../../../components/AppRequest/Manager';

export const getExamRoleTypes = async () => {
  const data = await AppRequestManager.send({
    url: '/exam/roles',
  });

  return _.get(data, 'data.data.items') || [];
};
