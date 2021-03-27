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
