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
}
