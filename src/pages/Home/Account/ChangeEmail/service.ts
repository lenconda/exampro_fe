import AppRequestManager from '../../../../components/AppRequest/Manager';
import _ from 'lodash';

export const changeUserEmail = async (email: string) => {
  if (!email) { return }
  const data = await AppRequestManager.send({
    url: '/user/change_email',
    method: 'POST',
    data: { email },
    handleError: false,
  });
  return _.get(data, 'data.data');
};
