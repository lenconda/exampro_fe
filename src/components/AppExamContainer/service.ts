import AppRequestManager from '../AppRequest/Manager';
import {
  ExamAnswerRequestData,
  ExamResponseData,
  ExamResultRequestData,
  ExamResultResponseData,
} from '../../interfaces';
import _ from 'lodash';

export const getExamInfo = async (examId: number, action: string = '') => {
  const actionRoleMap = {
    review: 'resource/exam/reviewer',
    participate: 'resource/exam/participant',
    participate_confirm: 'resource/exam/participant',
    result: 'resource/exam/participant',
    result_participant: 'resource/exam/initiator',
    invigilate: 'resource/exam/invigilator',
  };
  const data = await AppRequestManager.send({
    url: `/exam/${examId}?role=${actionRoleMap[action] || ''}`,
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

export const getExamResult = async (examId: number) => {
  const data = await AppRequestManager.send({
    url: `/exam/${examId}/result`,
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

export const startReviewExam = async (examId: number, participantEmail: string) => {
  const data = await AppRequestManager.send({
    url: `/exam/${examId}/review/${participantEmail}`,
    method: 'POST',
  });
  return;
};
