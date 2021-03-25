import AppRequestManager from '../../../components/AppRequest/Manager';

export const completeResetPassword = async (password: string, type: string) => {
  const data = await AppRequestManager.send({
    url: `/user/complete/${type}`,
    method: 'POST',
    data: { password },
  });
  return data;
};

export const completeRegistration = async (name: string = null, password: string, type: string) => {
  const data = await AppRequestManager.send({
    url: `/user/complete/${type}`,
    method: 'POST',
    data: { password, name },
  });
  return data;
};
