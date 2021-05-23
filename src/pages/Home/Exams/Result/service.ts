import AppRequestManager from '../../../../components/AppRequest/Manager';
import { ExamResultListItem } from '../../../../interfaces';
import _ from 'lodash';

export const getExamResults = async (examId: number) => {
  const data = await AppRequestManager.send({
    url: `/exam/${examId}/results`,
  });
  return (_.get(data, 'data.data.items') || []) as ExamResultListItem[];
};
