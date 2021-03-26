import AppRequestManager from '../../../components/AppRequest/Manager';

export const verifyEmail = async () => {
  const data = await AppRequestManager.send({
    url: '/user/complete/change_email',
    method: 'POST',
  });
  return data;
};
