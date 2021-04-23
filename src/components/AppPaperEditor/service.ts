import AppRequestManager from '../AppRequest/Manager';
import { PaperQuestionResponseData, PaperResponseData, QuestionResponseData, User } from '../../interfaces';
import _ from 'lodash';

export const queryAllQuestions = async (search: string): Promise<QuestionResponseData[]> => {
  const data = await AppRequestManager.send({
    url: `/question?${search ? `search=${search}&size=-1` : 'size=-1'}`,
  });

  return (_.get(data, 'data.data.items') || []) as QuestionResponseData[];
};

export const queryQuestions = async (search: string): Promise<QuestionResponseData[]> => {
  const data = await AppRequestManager.send({
    url: `/question?${search}`,
  });

  return (_.get(data, 'data.data.items') || []) as QuestionResponseData[];
};

export const getPaperQuestionsWithAnswers = async (paperId: number): Promise<PaperQuestionResponseData[]> => {
  const data = await AppRequestManager.send({
    url: `/paper/${paperId}/questions_answers`,
  });

  return (_.get(data, 'data.data.items') || []) as PaperQuestionResponseData[];
};

export const createPaperQuestion = (question: QuestionResponseData, points: number) => {
  return {
    question,
    points,
  } as PaperQuestionResponseData;
};

export const queryAllUsers = async (search: string): Promise<User[]> => {
  const data = await AppRequestManager.send({
    url: `/user/list?${search ? `search=${search}&size=-1` : 'size=-1'}`,
  });

  return (_.get(data, 'data.data.items') || []) as User[];
};

export const getPaperMaintainers = async (paperId: number) => {
  const data = await AppRequestManager.send({
    url: `/paper/${paperId}/maintainers`,
  });

  return (_.get(data, 'data.data.items') || []) as User[];
};

export const createPaper = async (paper: Partial<PaperResponseData>) => {
  const data = await AppRequestManager.send({
    url: '/paper',
    method: 'POST',
    data: paper,
  });
  return _.get(data, 'data.data') as PaperResponseData;
};

export const updatePaper = async (paperId: number, paper: Partial<PaperResponseData>) => {
  const data = await AppRequestManager.send({
    url: `/paper/${paperId}`,
    method: 'PATCH',
    data: paper,
  });
  return _.get(data, 'data.data');
};

export const createPaperQuestions = async (
  paperId: number,
  paperQuestions: Partial<PaperQuestionResponseData>[],
) => {
  const data = await AppRequestManager.send({
    url: `/paper/${paperId}/questions`,
    method: 'POST',
    data: paperQuestions.map((paperQuestion) => {
      const { id, points } = paperQuestion;
      return {
        id,
        points,
      };
    }),
  });
  return _.get(data, 'data.data');
};

export const createPaperMaintainers = async (paperId: number, maintainers: User[]) => {
  const data = await AppRequestManager.send({
    url: `/paper/${paperId}/maintainers`,
    method: 'POST',
    data: maintainers.map((maintainer) => maintainer.email),
  });
  return _.get(data, 'data.data');
};
