import AppRequestManager from './components/AppRequest/Manager';
import _ from 'lodash';

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
