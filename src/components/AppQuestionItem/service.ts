import { AppQuestionMetaData } from '../AppQuestionEditor';
import AppRequestManager from '../AppRequest/Manager';
import { Question, QuestionCategory, QuestionChoice, QuestionResponseData, QuestionType } from '../../interfaces';
import { pipeQuestionResponseToMetadata } from '../../utils/pipes';
import _ from 'lodash';

export const deleteQuestion = async (questionId: number) => {
  const data = await AppRequestManager.send({
    url: `/question/${questionId}`,
    method: 'DELETE',
  });
  return data;
};
