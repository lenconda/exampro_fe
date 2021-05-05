import { AppQuestionAnswerType, QuestionAnswerStatus, QuestionResponseData } from '../interfaces';
import DraftUtils, { EditorState } from 'draft-js';
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
  if (!_.isArray(answer)) { return 'nil' }
  switch (questionType) {
  case 'single_choice': {
    if (answer.length === 1) {
      return 'full';
    } else {
      return 'nil';
    }
  }
  case 'multiple_choices': {
    if (answer.length === 0) {
      return 'nil';
    } else if (answer.length === 1) {
      return 'partial';
    } else {
      return 'full';
    }
  }
  case 'fill_in_blank': {
    if (answer.filter((item) => !item).length === answer.length) {
      return 'nil';
    }
    for (const item of answer) {
      if (!item) {
        return 'partial';
      }
    }
    return 'full';
  }
  case 'short_answer': {
    const [contentString] = answer;
    const content = DraftUtils.convertFromRaw(JSON.parse(contentString));
    if (content.hasText()) {
      return 'full';
    } else {
      return 'nil';
    }
  }
  default:
    return 'nil';
  }
};
