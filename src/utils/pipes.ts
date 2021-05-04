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
import DraftUtils, { ContentState, EditorState } from 'draft-js';
import _ from 'lodash';

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

export const pipeQuestionAnswerRequestToMetadata = (
  questionType: QuestionType,
  answers: string[],
): AppQuestionAnswerType => {
  let questionAnswer: AppQuestionAnswerType;

  if (questionType === 'short_answer') {
    if (answers.length === 0) {
      questionAnswer = EditorState.createEmpty().getCurrentContent();
    } else {
      const currentContent = answers[0];
      if (currentContent) {
        questionAnswer = DraftUtils.convertFromRaw(JSON.parse(currentContent));
      } else {
        questionAnswer = EditorState.createEmpty().getCurrentContent();
      }
    }
  } else {
    questionAnswer = Array.from(answers);
  }

  return questionAnswer;
};

export const pipeQuestionAnswerMetadataToRequest = (
  questionType: QuestionType,
  answer: AppQuestionAnswerType,
): string[] => {
  let questionAnswerRequestData: string[] = [];

  if (questionType === 'short_answer') {
    if (answer instanceof ContentState) {
      questionAnswerRequestData = [JSON.stringify(DraftUtils.convertToRaw(answer))];
    } else {
      questionAnswerRequestData = [
        JSON.stringify(DraftUtils.convertToRaw(EditorState.createEmpty().getCurrentContent())),
      ];
    }
  } else if (_.isArray(answer)) {
    questionAnswerRequestData = answer;
  }

  return questionAnswerRequestData;
};
