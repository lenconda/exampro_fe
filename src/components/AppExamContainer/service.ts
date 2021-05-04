import AppRequestManager from '../AppRequest/Manager';
import { ExamResponseData } from '../../interfaces';
import _ from 'lodash';

export const getExamInfo = async (examId: number) => {
  const data = await AppRequestManager.send({
    url: `/exam/${examId}`,
  });
  return _.get(data, 'data.data') as ExamResponseData;
};
