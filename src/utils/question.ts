import { AppQuestionAnswerType, QuestionAnswerStatus, QuestionResponseData } from '../interfaces';
import { EditorState } from 'draft-js';
import _ from 'lodash';

export const generateDefaultQuestionAnswer = (question: QuestionResponseData): AppQuestionAnswerType => {
  if (question.type === 'short_answer') {
    return EditorState.createEmpty().getCurrentContent();
  }

  if (question.type === 'fill_in_blank') {
    return new Array(question.blankCount || 0).fill('');
  }

  return [];
};

export const getQuestionAnswerStatus = (
  question: QuestionResponseData,
  answer: string[],
): QuestionAnswerStatus => {
  const questionType = question.type;
  switch (questionType) {
  case 'single_choice': {
    if (_.isArray(answer) && answer.length === 1) {
      return 'full';
    } else {
      return 'nil';
    }
  }
  case 'multiple_choices': {
    if (_.isArray(answer)) {
      if (answer.length === 0) {
        return 'nil';
      } else if (answer.length === 1) {
        return 'partial';
      } else {
        return 'full';
      }
    } else {
      return 'nil';
    }
  }
  case 'fill_in_blank': {
    if (_.isArray(answer)) {
      for (const item of answer) {
        if (!item) {
          return 'partial';
        }
      }
      return 'full';
    } else {
      return 'nil';
    }
  }
  default:
    return 'nil';
  }
};
