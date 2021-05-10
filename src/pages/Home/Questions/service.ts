import AppRequestManager from '../../../components/AppRequest/Manager';
import _ from 'lodash';

export const queryQuestions = async (search: string) => {
  const data = await AppRequestManager.send({
    url: `/question?${search}`,
  });

  return _.get(data, 'data.data');
};

export const deleteQuestions = async (questionIds: number[]) => {
  const data = await AppRequestManager.send({
    url: '/question',
    data: { questions: questionIds },
    method: 'DELETE',
  });
  return _.get(data, 'data.data');
};
