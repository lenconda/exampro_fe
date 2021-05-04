import AppRequestManager from '../AppRequest/Manager';
import { PaperQuestionResponseData } from '../../interfaces';
import _ from 'lodash';

export const getPaperQuestions = async (paperId: number) => {
  const data = await AppRequestManager.send({
    url: `/paper/${paperId}/questions`,
  });
  return (_.get(data, 'data.data.items') || []) as PaperQuestionResponseData[];
};
