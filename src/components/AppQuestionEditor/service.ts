import { AppQuestionMetaData, QuestionChoiceWithAnswer } from '.';
import AppRequestManager from '../AppRequest/Manager';
import { Question, QuestionCategory, QuestionChoice, QuestionResponseData, QuestionType } from '../../interfaces';
import _ from 'lodash';
import DraftUtils, { ContentState, EditorState } from 'draft-js';

export const createCategory = async (name: string) => {
  if (!name) {
    return null;
  }
  const data = await AppRequestManager.send({
    url: '/question/category',
    method: 'POST',
    data: { name },
  });
  return _.get(data, 'data.data');
};

export const createCategories = async (names: string[]): Promise<QuestionCategory[]> => {
  const categories = await Promise.all(names.map((name) => createCategory(name)));
  return categories;
};

export const searchCategory = async (search: string) => {
  const data = await AppRequestManager.send({
    url: `/question/category?search=${search}`,
  });
  return _.get(data, 'data.data');
};

export const getAllCategories = async () => {
  const data = await AppRequestManager.send({
    url: '/question/category',
  });
  return _.get(data, 'data.data');
};

export const getAllCategoriesWithoutPagination = async () => {
  const data = await getAllCategories();
  return _.get(data, 'items') || [];
};

export const createQuestionCategories = async (questionIds: number[], categoryIds: number[]) => {
  const data = await AppRequestManager.send({
    url: '/question/question_categories',
    method: 'POST',
    data: {
      questions: questionIds,
      categories: categoryIds,
    },
  });
  return _.get(data, 'data.data');
};

export const createQuestionChoices = async (questionId: number, choices: string[]) => {
  const data = await AppRequestManager.send({
    url: `/question/${questionId}/choices`,
    method: 'POST',
    data: {
      choices: choices.map((content, index) => {
        return {
          content,
          order: index + 1,
        };
      }),
    },
  });
  return _.get(data, 'data.data');
};

export const createQuestionAnswer = async (questionId: number, answers: string[]) => {
  const data = await AppRequestManager.send({
    url: `/question/${questionId}/answers`,
    method: 'POST',
    data: {
      answers: answers.map((content, index) => {
        return {
          content,
          order: index + 1,
        };
      }),
    },
  });
  return data;
};

export interface QuestionOptions {
  choices: QuestionChoice[];
  answer: ContentState | string[];
}

export const createQuestion = async (
  content: ContentState,
  type: QuestionType,
  categories: (QuestionCategory | string)[],
  options: Partial<QuestionOptions> = {},
) => {
  const categoryStrings = categories
    .filter((category) => typeof category === 'string') as string[];
  const categoryIds = (categories.filter((category) => typeof category !== 'string') as QuestionCategory[])
    .map((category) => category.id);
  const newCategories = await createCategories(categoryStrings);

  const questionData = await AppRequestManager.send({
    url: '/question',
    method: 'POST',
    data: {
      content: JSON.stringify(DraftUtils.convertToRaw(content)),
      type,
      categories: categoryIds.concat(newCategories.map((category) => category.id)),
    },
  });

  const question = _.get(questionData, 'data.data') as Question;

  if (question) {
    const { id } = question;
    const { answer } = options;

    switch (type) {
    case 'single_choice': {
      const { choices = [] } = options;
      await createQuestionChoices(id, choices.map((choice) => choice.content));
      if (Array.isArray(answer)) {
        await createQuestionAnswer(id, answer);
      }
      break;
    }
    case 'multiple_choices': {
      const { choices = [] } = options;
      await createQuestionChoices(id, choices.map((choice) => choice.content));
      if (Array.isArray(answer)) {
        await createQuestionAnswer(id, answer);
      }
      break;
    }
    case 'short_answer': {
      if (answer instanceof ContentState) {
        await createQuestionAnswer(id, [JSON.stringify(DraftUtils.convertToRaw(answer))]);
      }
      break;
    }
    case 'fill_in_blank': {
      if (Array.isArray(answer)) {
        await createQuestionAnswer(id, answer);
      }
      break;
    }
    default:
      break;
    }
  }
};

export const updateQuestion = async (
  questionId: number,
  content: ContentState,
  type: QuestionType,
  categories: (QuestionCategory | string)[],
  options: Partial<QuestionOptions> = {},
) => {
  const categoryStrings = categories
    .filter((category) => typeof category === 'string') as string[];
  const existedCategoryIds = (categories.filter((category) => typeof category !== 'string') as QuestionCategory[])
    .map((category) => category.id);
  const newCategories = await createCategories(categoryStrings);
  const categoryIds = existedCategoryIds.concat(newCategories.map((category) => category.id));

  await AppRequestManager.send({
    url: `/question/${questionId}`,
    method: 'PATCH',
    data: {
      content: JSON.stringify(DraftUtils.convertToRaw(content)),
      type,
    },
  });

  await createQuestionCategories([questionId], categoryIds);

  const { answer } = options;

  switch (type) {
  case 'single_choice': {
    const { choices = [] } = options;
    await createQuestionChoices(questionId, choices.map((choice) => choice.content));
    if (Array.isArray(answer)) {
      await createQuestionAnswer(questionId, answer);
    }
    break;
  }
  case 'multiple_choices': {
    const { choices = [] } = options;
    await createQuestionChoices(questionId, choices.map((choice) => choice.content));
    if (Array.isArray(answer)) {
      await createQuestionAnswer(questionId, answer);
    }
    break;
  }
  case 'short_answer': {
    if (answer instanceof ContentState) {
      await createQuestionAnswer(questionId, [JSON.stringify(DraftUtils.convertToRaw(answer))]);
    }
    break;
  }
  case 'fill_in_blank': {
    if (Array.isArray(answer)) {
      await createQuestionAnswer(questionId, answer);
    }
    break;
  }
  default:
    break;
  }
};

export const getQuestionWithAnswers = async (questionId: number): Promise<AppQuestionMetaData> => {
  const data = await AppRequestManager.send({
    url: `/question/${questionId}`,
  });
  const questionData = _.get(data, 'data.data') as QuestionResponseData;
  const {
    type,
    id,
    content,
    answers = [],
    choices = [] as QuestionChoice[],
    categories = [] as QuestionCategory[],
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
    content: DraftUtils.convertFromRaw(JSON.parse(content)),
  } as AppQuestionMetaData;

  return result;
};
