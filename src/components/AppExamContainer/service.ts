import AppRequestManager from '../AppRequest/Manager';
import {
  ExamAnswerRequestData,
  ExamResponseData,
  ExamResultRequestData,
  ExamResultResponseData,
} from '../../interfaces';
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

export const getParticipantExamResult = async (examId: number, participantEmail: string) => {
  const data = await AppRequestManager.send({
    url: `/exam/${examId}/result/${participantEmail}`,
  });
  return _.get(data, 'data.data') as ExamResultResponseData;
};

export const putParticipantExamScores = async (
  examId: number,
  participantEmail: string,
  score: ExamResultRequestData,
) => {
  const data = await AppRequestManager.send({
    url: `/exam/${examId}/score/${participantEmail}`,
    data: { score },
    method: 'PUT',
  });
  return;
};
