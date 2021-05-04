import { AppQuestionMetaData, QuestionCategory, QuestionChoice, QuestionResponseData } from '../interfaces';
import DraftUtils, { EditorState } from 'draft-js';

export const pipeQuestionResponseToMetadata = (questionData: QuestionResponseData): AppQuestionMetaData => {
  const {
    type,
    id,
    content,
    answers = [],
    choices = [] as QuestionChoice[],
    categories = [] as QuestionCategory[],
    blankCount,
    creator,
    summary,
  } = questionData;

  let questionAnswer;

  if (type === 'short_answer') {
    if (answers.length === 0) {
      questionAnswer = EditorState.createEmpty();
    } else {
      const { id, content: currentContent } = answers[0];
      if (currentContent) {
        questionAnswer = DraftUtils.convertFromRaw(JSON.parse(currentContent));
      } else {
        questionAnswer = EditorState.createEmpty();
      }
    }
  } else {
    questionAnswer = answers.map((answer) => answer.content);
  }

  const result = {
    id,
    type,
    choices,
    answer: questionAnswer,
    categories,
    content: content ? DraftUtils.convertFromRaw(JSON.parse(content)) : content,
    blankCount,
    creator,
    summary,
  } as AppQuestionMetaData;

  return result;
};
