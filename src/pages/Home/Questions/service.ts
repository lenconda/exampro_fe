import AppRequestManager from '../../../components/AppRequest/Manager';
import { PaperResponseData } from '../../../interfaces';
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

export const queryAllPapers = async (search: string) => {
  const data = await AppRequestManager.send({
    url: `/paper?search=${search}&size=-1`,
  });
  return (_.get(data, 'data.data.items') || []) as PaperResponseData[];
};
