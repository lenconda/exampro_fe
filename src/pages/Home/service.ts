import { Location } from 'history';
import _ from 'lodash';
import AppRequestManager from '../../components/AppRequest/Manager';

export const getUserProfile = async () => {
  const data = await AppRequestManager.send({
    url: '/user/profile',
  });
  return _.get(data, 'data.data');
};

export const getSidebarMenu = async () => {
  const data = await AppRequestManager.send({
    url: '/menu',
  });
  return _.get(data, 'data.data');
};

export const logout = async (redirect: string): Promise<string> => {
  const data = await AppRequestManager.send({
    url: '/auth/logout',
    method: 'POST',
    data: { redirect },
  });
  return _.get(data, 'data.data.redirect');
};
