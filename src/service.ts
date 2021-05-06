import AppRequestManager from './components/AppRequest/Manager';
import { User } from './interfaces';
import _ from 'lodash';
import katex from 'katex';

export const uploadImage = async (image: File) => {
  const formData = new FormData();
  formData.append('file', image);
  const data = await AppRequestManager.send({
    url: '/resource/image',
    method: 'POST',
    data: formData,
  });
  return _.get(data, 'data.data.url');
};

export const renderKatex = (equation: string): string => {
  return katex.renderToString(equation);
};

export const queryAllUsers = async (search: string): Promise<User[]> => {
  const data = await AppRequestManager.send({
    url: `/user/list?${search ? `search=${search}&size=-1` : 'size=-1'}`,
  });

  return (_.get(data, 'data.data.items') || []) as User[];
};

export const getUserProfile = async (email: string) => {
  const data = await AppRequestManager.send({
    url: `/user/profile/${email}`,
  });
  return _.get(data, 'data.data') as User;
};
