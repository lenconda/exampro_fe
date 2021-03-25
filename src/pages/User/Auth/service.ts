import AppRequestManager from '../../../components/AppRequest/Manager';

export const getEmailAuthType = async (email: string) => {
  const data = await AppRequestManager.send({
    url: '/auth/check',
    method: 'POST',
    data: { email },
  });
  return data.data.data.type;
};

export const login = async (email: string, password: string) => {
  const data = await AppRequestManager.send({
    url: '/auth/login',
    method: 'POST',
    data: {
      email,
      password,
    },
  });
  return data;
};
