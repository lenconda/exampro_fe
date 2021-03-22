import { Reducer } from 'redux';
import { Effect, Subscription } from 'dva';
import { ConnectState } from '.';

export interface AppState {
  count: number;
}

export interface AppModelType {
  namespace: 'app';
  state: AppState;
  effects: {
    increaseCount: Effect;
    decreaseCount: Effect;
  };
  reducers: {
    setCount: Reducer<AppState>;
  };
  subscriptions: {
    setup: Subscription;
  };
}

const AppModel: AppModelType = {
  namespace: 'app',
  state: {
    count: 0,
  },
  effects: {
    * increaseCount({ payload }, { put, select }) {
      const currentCount: number = yield select((state: ConnectState) => state.app.count);
      const result = currentCount + 1;
      yield put({
        type: 'setCount',
        payload: result,
      });
    },
    * decreaseCount({ payload }, { put, select }) {
      const currentCount: number = yield select((state: ConnectState) => state.app.count);
      const result = currentCount - 1;
      yield put({
        type: 'setCount',
        payload: result,
      });
    },
  },
  reducers: {
    setCount(state, { payload }): AppState {
      if (!payload && typeof payload !== 'number') {
        return state;
      }

      return {
        ...state,
        count: payload,
      };
    },
  },
  subscriptions: {
    setup({ history }) {
      history.listen(data => console.log(data));
    },
  },
};

export default AppModel;
