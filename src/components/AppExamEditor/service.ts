import AppRequestManager from '../AppRequest/Manager';
import { ExamResponseData, PaperResponseData, User } from '../../interfaces';
import _ from 'lodash';

export const queryAllExams = async (search: string): Promise<ExamResponseData[]> => {
  const data = await AppRequestManager.send({
    url: `/exam?${search ? `search=${search}&size=-1` : 'size=-1'}`,
  });

  return (_.get(data, 'data.data.items') || []) as ExamResponseData[];
};

export const queryAllMaintainedPapers = async (search: string): Promise<PaperResponseData[]> => {
  const data = await AppRequestManager.send({
    url: `/paper?${search ? `search=${search}` : ''}&size=-1&roles=resource/paper/owner,resource/paper/maintainer`,
  });

  return (_.get(data, 'data.data.items') || []) as PaperResponseData[];
};

export const queryExams = async (search: string): Promise<ExamResponseData[]> => {
  const data = await AppRequestManager.send({
    url: `/exam?${search}`,
  });

  return (_.get(data, 'data.data.items') || []) as ExamResponseData[];
};

export const getExamUsers = async (examId: number, role: string) => {
  const data = await AppRequestManager.send({
    url: `/exam/${examId}/${role}`,
  });

  return (_.get(data, 'data.data.items') || []) as User[];
};

export const createExam = async (exam: Partial<ExamResponseData>) => {
  const data = await AppRequestManager.send({
    url: '/exam',
    method: 'POST',
    data: exam,
  });
  return _.get(data, 'data.data') as ExamResponseData;
};

export const updateExam = async (examId: number, exam: Partial<ExamResponseData>) => {
  const data = await AppRequestManager.send({
    url: `/exam/${examId}`,
    method: 'PATCH',
    data: exam,
  });
  return _.get(data, 'data.data');
};

export const createExamUsers = async (examId: number, users: User[], role: string) => {
  const data = await AppRequestManager.send({
    url: `/exam/${examId}/${role}`,
    method: 'POST',
    data: {
      emails: users.map((user) => user.email),
    },
  });
  return _.get(data, 'data.data');
};
