import {
  AppQuestionAnswerType,
  AppQuestionMetaData,
  QuestionAnswer,
  QuestionAnswerResponseData,
  QuestionCategory,
  QuestionChoice,
  QuestionResponseData,
  QuestionType,
} from '../interfaces';
import DraftUtils, { EditorState } from 'draft-js';

export const pipeQuestionAnswerResponseToMetadata = (
  questionType: QuestionType,
  answers: QuestionAnswerResponseData,
): AppQuestionAnswerType => {
  let questionAnswer: AppQuestionAnswerType;

  if (questionType === 'short_answer') {
    if (answers.length === 0) {
      questionAnswer = EditorState.createEmpty().getCurrentContent();
    } else {
      const { content: currentContent } = answers[0];
      if (currentContent) {
        questionAnswer = DraftUtils.convertFromRaw(JSON.parse(currentContent));
      } else {
        questionAnswer = EditorState.createEmpty().getCurrentContent();
      }
    }
  } else {
    questionAnswer = answers.map((answer) => answer.content);
  }

  return questionAnswer;
};

export const pipeQuestionResponseToMetadata = (questionData: QuestionResponseData): AppQuestionMetaData => {
  const {
    type,
    id,
    content,
    answers = [] as QuestionAnswer[],
    choices = [] as QuestionChoice[],
    categories = [] as QuestionCategory[],
    blankCount,
    creator,
    summary,
  } = questionData;

  const result = {
    id,
    type,
    choices,
    answer: pipeQuestionAnswerResponseToMetadata(type, answers),
    categories,
    content: content ? DraftUtils.convertFromRaw(JSON.parse(content)) : content,
    blankCount,
    creator,
    summary,
  } as AppQuestionMetaData;

  return result;
};
