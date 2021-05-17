import AppRequestManager from '../../../../components/AppRequest/Manager';
import { PaginationResponse, UserExam } from '../../../../interfaces';
import _ from 'lodash';

export const queryExamParticipantsWithUserExamRelation = (examId: number) => {
  if (!_.isNumber(examId)) { return }
  return async (search: string) => {
    const data = await AppRequestManager.send({
      url: `/exam/${examId}/participant?relation=user_exam&${search}`,
    });
    return _.get(data, 'data.data') as PaginationResponse<UserExam>;
  };
};

export const changeFraudStatus = async (examId: number, participantEmail: string, status: boolean) => {
  if (!(examId && participantEmail)) {
    return;
  }

  const data = await AppRequestManager.send({
    url: `/exam/${examId}/fraud/${participantEmail}`,
    method: status ? 'POST' : 'DELETE',
  });

  return data;
};
