import AppRequestManager from '../../../components/AppRequest/Manager';

export const getEmailAuthType = async (email: string) => {
  try {
    const data = await AppRequestManager.send({
      url: '/auth/check',
      method: 'POST',
      data: { email },
    });
    return data.data.data.type;
  } catch (error) {
    return Promise.reject(error);
  }
};
