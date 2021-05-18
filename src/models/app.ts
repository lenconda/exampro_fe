import { ConnectState } from '.';
import { LanguageOption, User } from '../interfaces';
import { getUserProfile } from '../pages/Home/service';
import { Effect, Subscription } from 'dva';
import _ from 'lodash';
import { Reducer } from 'redux';
import { EventEmitter } from 'events';

export type I18N = Record<string, any>;

export interface AppState {
  count: number;
  locale: string;
  i18n: I18N;
  languages: LanguageOption[];
  emitter: EventEmitter;
  user?: User;
}

export interface AppModelType {
  namespace: 'app';
  state: AppState;
  effects: {
    getTexts: Effect;
    getEventEmitter: Effect;
    getUserProfile: Effect;
    handleSetI18nTexts: Effect;
  };
  reducers: {
    setUserProfile: Reducer<AppState>;
    setI18nTexts: Reducer<AppState>;
    setLanguageOptions: Reducer<AppState>;
    setLocale: Reducer<AppState>;
  };
  subscriptions: {
    setup: Subscription;
  };
}

const AppModel: AppModelType = {
  namespace: 'app',
  state: {
    count: 0,
    locale: localStorage.getItem('locale') || 'en-US',
    i18n: {},
    languages: [
      {
        title: 'English (United States)',
        code: 'en-US',
      },
    ],
    emitter: new EventEmitter(),
  },
  effects: {
    * getTexts({ payload }, { select }) {
      const currentI18n: I18N = yield select((state: ConnectState) => state.app.i18n);
      const currentLocale = yield select((state: ConnectState) => state.app.locale);
      const enUSTexts = _.get(currentI18n, 'en-US') || {};
      const localeTexts = _.get(currentI18n, currentLocale) || {};
      return _.merge(enUSTexts, localeTexts);
    },
    * getEventEmitter({ payload }, { select }) {
      const emitter: EventEmitter = yield select((state: ConnectState) => state.app.emitter);
      return emitter;
    },
    * getUserProfile({ payload }, { call, put }) {
      yield put({
        type: 'setUserProfile',
        payload: yield call(getUserProfile) as User,
      });
    },
    * handleSetI18nTexts({ payload }, { select, call, put }) {
      yield put({
        type: 'setI18nTexts',
        payload,
      });
      const emitter = yield select((state: ConnectState) => state.app.emitter);
      if (emitter && emitter instanceof EventEmitter) {
        emitter.emit('i18n_updated');
      }
    },
  },
  reducers: {
    setUserProfile(state, { payload }) {
      return {
        ...state,
        user: _.cloneDeep(payload),
      };
    },
    setI18nTexts(state, { payload }) {
      return {
        ...state,
        i18n: _.cloneDeep(payload),
      };
    },
    setLanguageOptions(state, { payload }) {
      return {
        ...state,
        languages: _.cloneDeep(payload),
      };
    },
    setLocale(state, { payload }) {
      return {
        ...state,
        locale: payload,
      };
    },
  },
  subscriptions: {
    setup({ history }) {},
  },
};

export default AppModel;
