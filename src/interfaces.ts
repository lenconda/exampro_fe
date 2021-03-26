import { Dispatch as ReduxDispatch, AnyAction } from 'redux';

export interface User {
  email: string;
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
