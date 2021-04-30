import { Dispatch as ReduxDispatch, AnyAction } from 'redux';

export interface User {
  email: string;
  description?: string;
  avatar?: string;
  name?: string;
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

export interface Exam {
  id: number;
  title: string;
  notifyParticipants: boolean;
  public: boolean;
  grades: boolean;
  startTime: string;
  endTime: string;
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
  question: Question;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface QuestionCategory {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface QuestionResponseData extends Question {
  answers?: Record<string, string>[];
  choices?: Record<string, string>[];
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
  description: string;
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

export interface ExamResponseData {
  id?: number;
  title: string;
  startTime?: string;
  endTime: string;
  grades: boolean;
  notifyParticipants: boolean;
  public: boolean;
  delay: number;
  paper: PaperResponseData;
  role?: RoleResponseData;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}
