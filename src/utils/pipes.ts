import {
  AppQuestionAnswerType,
  AppQuestionMetaData,
  MenuItemMetadata,
  MenuItemResponseData,
  MenuTreeItemMetadata,
  QuestionAnswer,
  QuestionAnswerResponseData,
  QuestionCategory,
  QuestionChoice,
  QuestionResponseData,
  QuestionType,
  RoleResponseData,
  RoleTreeItemResponseData,
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

export const pipeMenuItemResponseToMetadata = (item: MenuItemResponseData): MenuItemMetadata => {
  return {
    ..._.omit(item, ['parentMenu']),
    children: [],
  };
};

export const pipeMenusResponseToTree = (menuItems: MenuItemResponseData[]): MenuItemMetadata[] => {
  const currentMenuItemResponseDataItems = Array.from(menuItems);
  const currentMenuItemMetadataItems = Array.from(menuItems).map(pipeMenuItemResponseToMetadata) as MenuItemMetadata[];
  const menuIdIndexMap = {};
  const topLevelMenuIds: number[] = [];
  for (const [index, currentMenuItem] of currentMenuItemResponseDataItems.entries()) {
    menuIdIndexMap[currentMenuItem.id] = index;
    if (!currentMenuItem.parentMenu) {
      topLevelMenuIds.push(currentMenuItem.id);
    }
  }
  for (const currentMenuItem of currentMenuItemResponseDataItems) {
    if (currentMenuItem.parentMenu) {
      const currentParentMenuItemMetadata = currentMenuItemMetadataItems[menuIdIndexMap[currentMenuItem.parentMenu.id]];
      const currentMenuItemMetadata = currentMenuItemMetadataItems[menuIdIndexMap[currentMenuItem.id]];
      if (currentParentMenuItemMetadata && currentMenuItemMetadata) {
        currentParentMenuItemMetadata.children.push(currentMenuItemMetadata);
      }
    }
  }
  const result = currentMenuItemMetadataItems.filter((item) => topLevelMenuIds.indexOf(item.id) !== -1);
  return result;
};

export const pipeMenusResponseToFlattenedTree = (menuItems: MenuItemMetadata[]): MenuTreeItemMetadata[] => {
  const currentMenuTree = Array.from(menuItems);
  const getFlappedTree = (
    currentLevelTreeNodes: MenuItemMetadata[],
    level: number,
    currentResult: MenuTreeItemMetadata[],
  ): MenuTreeItemMetadata[] => {
    let result = Array.from(currentResult);
    for (const currentLevelTreeNode of currentLevelTreeNodes) {
      result.push({
        ..._.omit(currentLevelTreeNode, ['children']),
        level,
      });
      if (_.isArray(currentLevelTreeNode.children) && currentLevelTreeNode.children.length > 0) {
        result = getFlappedTree(currentLevelTreeNode.children, level + 1, result);
      }
    }
    return result;
  };
  const result = getFlappedTree(currentMenuTree, 0, []);
  return result;
};

export const pipeRolesListToTree = (list: RoleResponseData[]): RoleTreeItemResponseData[] => {
  const roleObject = {};
  for (const role of list) {
    const { description, createdAt, updatedAt, id } = role;
    const segments = id.split('/');
    for (let i = 0; i < segments.length; i += 1) {
      _.set(roleObject, `${segments.slice(0, i + 1).join('.')}.metadata`, {
        createdAt,
        updatedAt,
        ...(i === segments.length - 1 ? { description } : {}),
        originalId: segments.slice(0, i + 1).join('/'),
      });
    }
    _.set(roleObject, `${role.id.split('/').join('.')}.isLeaf`, true);
  }
  const traverse = (raw: Record<string, any>): RoleTreeItemResponseData[] => {
    const result = Object.keys(raw)
      .filter((key) => key !== 'metadata' && key !== 'isLeaf')
      .map((key) => {
        const value = raw[key];
        if (value.isLeaf) {
          return { id: key, children: [], ...value.metadata };
        } else {
          return { id: key, children: traverse(value), ...value.metadata };
        }
      });
    return result || [];
  };
  return traverse(roleObject);
};

export const pipeRolesTreeToList = (tree: RoleTreeItemResponseData[]): RoleResponseData[] => {
  const traverse = (
    currentList: RoleTreeItemResponseData[],
    result: RoleResponseData[],
  ): RoleResponseData[] => {
    let currentResult = Array.from(result);
    for (const item of currentList) {
      const { originalId, id, children = [], ...metadata } = item;
      currentResult.push({
        ..._.omit(metadata, ['children']),
        id: originalId,
      } as RoleResponseData);
      if (children.length > 0) {
        currentResult = traverse(children, currentResult);
      }
    }
    return currentResult;
  };
  return traverse(tree, []);
};
