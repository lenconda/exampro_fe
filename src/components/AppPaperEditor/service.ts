import AppRequestManager from '../AppRequest/Manager';
import { PaperQuestionResponseData, QuestionResponseData, User } from '../../interfaces';
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
