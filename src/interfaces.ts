import { ContentState } from 'draft-js';
import React from 'react';
import { Dispatch as ReduxDispatch, AnyAction } from 'redux';

export interface User {
  email: string;
  description?: string;
  avatar?: string;
  name?: string;
  roles?: RoleResponseData[];
  verifying?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface Dispatch {
  dispatch: ReduxDispatch<AnyAction>;
}

export interface SidebarMenuItem {
  id: number;
  title: string;
  icon: string;
  pathname: string;
  show: boolean;
  order: number;
  items?: SidebarMenuItem[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface ExamRole {
  id: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface PaginationResponse<T = any> {
  items: T[];
  total: number;
}

export interface PaginationData {
  page?: number;
  size?: number;
  lastCursor?: React.ReactText;
  order?: 'asc' | 'desc';
}

export interface PaginationSearchData extends PaginationData {
  search?: string;
}

export type CustomPaginationData<T extends Record<string, any> = {}> = PaginationSearchData & T;

export interface UserExam {
  id: number;
  confirmed: boolean;
  leftTimes: number;
  reviewing: boolean;
  fraud: boolean;
  user?: User;
  startTime?: string;
  submitTime?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface Exam {
  id: number;
  title: string;
  notifyParticipants: boolean;
  public: boolean;
  grades: boolean;
  delay: number;
  startTime: string;
  endTime: string;
  resultTime: string;
  userExam?: UserExam;
  paper?: PaperResponseData;
  initiator?: User;
  duration?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export type QuestionType = 'single_choice' | 'multiple_choices' | 'fill_in_blank' | 'short_answer';

export interface Question {
  id: number;
  content: string;
  type: QuestionType;
  blankCount?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  creator?: User;
  summary?: string;
}

export interface QuestionChoice {
  id: number;
  content: string;
  order: number;
  question?: Question;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export type QuestionAnswer = QuestionChoice;
export type QuestionAnswerResponseData = QuestionAnswer[];
export type QuestionChoiceResponseData = QuestionChoice[];

export interface QuestionCategory {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface QuestionResponseData extends Question {
  answers?: QuestionAnswerResponseData;
  choices?: QuestionChoiceResponseData;
  categories?: QuestionCategory[];
}

export interface PaperQuestionResponseData {
  id?: number;
  order?: number;
  points: number;
  question: QuestionResponseData;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface RoleResponseData {
  id: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface PaperResponseData {
  id?: number;
  title: string;
  public: boolean;
  missedChoicesScore: number;
  banned?: boolean;
  role?: RoleResponseData;
  creator?: User;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export type ExamResponseData = Exam;

export type QuestionChoiceWithAnswer = QuestionChoice & {
  isAnswer: boolean;
};

export type AppQuestionAnswerType = string[] | ContentState;

export interface AppQuestionMetaData {
  type: QuestionType;
  id?: number;
  content?: ContentState;
  choices?: QuestionChoice[];
  answer?: AppQuestionAnswerType;
  categories?: QuestionCategory[];
  blankCount?: number;
}

export type ExamAnswerRequestData = Record<string, string[]>;
export type ExamScoreRequestData = Record<string, number>;
export interface ExamAnswerScoreItem {
  answer: string[];
  scores: number;
  points: number;
}
export type ExamResultResponseData = Record<string, ExamAnswerScoreItem>;

export type QuestionAnswerStatus = 'full' | 'partial' | 'nil';
export type AnswerScoreStatus = QuestionAnswerStatus | 'ignore';

export interface ExamResultMetadata {
  totalScore: number;
  totalPoints: number;
  percentage: number | string;
}

export type ExamResultRequestData = Record<string, number>;

export type ExamStatus = 'PREPARING' | 'IN_PROGRESS' | 'FINISHED' | 'RESULTED';

export interface ChangePasswordState {
  old: string;
  new: string;
  confirm: string;
}

export interface MenuItemResponseData {
  id: number;
  title: string;
  icon: string;
  pathname: string;
  show: boolean;
  order: number;
  parentMenu?: MenuItemResponseData;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export type MenuItemMetadata = Omit<MenuItemResponseData & {
  children?: MenuItemMetadata[];
}, 'parentMenu'>;

export interface MenuItemRequestData {
  title: string;
  pathname: string;
  icon: string;
  roles?: string[];
  order?: number;
  parent?: number;
}

export type MenuTreeItemMetadata = Omit<MenuItemMetadata, 'children'> & {
  level: number;
};

export interface MenuTreeItemLevelPermission {
  left: boolean;
  right: boolean;
}

export interface MenuRoleResponseData {
  menu: MenuItemResponseData;
  role: RoleResponseData;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface UserRoleResponseData {
  user: User;
  role: RoleResponseData;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface UserRequestData {
  email: string;
  password: string;
  roles?: string[];
}

export interface RoleTreeItemResponseData {
  id: string;
  originalId: string;
  isLeaf?: boolean;
  description?: string;
  children?: RoleTreeItemResponseData[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface DynamicConfig {
  id: number;
  pathname: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface LanguageOption {
  title: string;
  code: string;
}
