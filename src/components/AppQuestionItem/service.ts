import AppRequestManager from '../AppRequest/Manager';
import _ from 'lodash';

export const deleteQuestion = async (questionId: number) => {
  const data = await AppRequestManager.send({
    url: `/question/${questionId}`,
    method: 'DELETE',
  });
  return data;
};
