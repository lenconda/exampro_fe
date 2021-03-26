import { Dispatch as ReduxDispatch, AnyAction } from 'redux';

export interface User {
  email: string;
  avatar?: string;
  name?: string;
}

export interface Dispatch {
  dispatch: ReduxDispatch<AnyAction>;
}
