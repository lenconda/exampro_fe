import AppRequestManager from '../AppRequest/Manager';
import { ExamAnswerRequestData, ExamResponseData } from '../../interfaces';
import _ from 'lodash';

export const getExamInfo = async (examId: number) => {
  const data = await AppRequestManager.send({
    url: `/exam/${examId}`,
  });
  return _.get(data, 'data.data') as ExamResponseData;
};

export const submitParticipantAnswer = async (examId: number, answer: ExamAnswerRequestData) => {
  const data = await AppRequestManager.send({
    url: `/exam/${examId}/result`,
    method: 'POST',
    data: { answer },
  });
  return _.get(data, 'data.data');
};

export const startExam = async (examId: number) => {
  await AppRequestManager.send({
    url: `/exam/${examId}/start`,
    method: 'POST',
  });
  return;
};
