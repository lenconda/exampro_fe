import { ConnectState } from '.';
import { ExamStatus, User } from '../interfaces';
import { getUserProfile } from '../pages/Home/service';
import { Effect, Subscription } from 'dva';
import _ from 'lodash';
import { Reducer } from 'redux';

// export interface I18N {
//   [key: string]: {
//     errors?: Record<string, string>;
//     ui?: {
//       [pathname: string]: Record<string, string>;
//     };
//     avatarDropdown?: Record<string, string>;
//     sidebarMenu?: Record<string, string>;
//     examRoles?: Record<string, string>;
//     table?: Record<string, string>;
//     system?: Record<string, string>;
//     examStatuses?: Record<ExamStatus, string>;
//     dialog?: Record<string, string>;
//     examCard?: Record<string, string>;
//     editor?: Record<string, string>;
//     questionEditor?: Record<string, string>;
//     questionItem?: Record<string, string>;
//     searchBar?: Record<string, string>;
//     paperEditor?: Record<string, string>;
//     paperQuestionItem?: Record<string, string>;
//     examEditor?: Record<string, string>;
//     dateTimePicker?: Record<string, string>;
//     paperContainer?: Record<string, string>;
//     examContainer?: Record<string, string>;
//     roleSelector?: Record<string, string>;
//     roleAutocomplete?: Record<string, string>;
//   };
// }

export type I18N = Record<string, any>;

export interface AppState {
  count: number;
  locale: string;
  i18n: I18N;
  user?: User;
}

export interface AppModelType {
  namespace: 'app';
  state: AppState;
  effects: {
    getTexts: Effect;
    getUserProfile: Effect;
  };
  reducers: {
    setUserProfile: Reducer<AppState>;
    setI18nTexts: Reducer<AppState>;
  };
  subscriptions: {
    setup: Subscription;
  };
}

const AppModel: AppModelType = {
  namespace: 'app',
  state: {
    count: 0,
    locale: 'zh-CN',
    i18n: {},
  },
  effects: {
    * getTexts({ payload }, { select }) {
      const currentI18n: I18N = yield select((state: ConnectState) => state.app.i18n);
      const currentLocale = yield select((state: ConnectState) => state.app.locale);
      const enUSTexts = _.get(currentI18n, 'en_US') || {};
      const localeTexts = _.get(currentI18n, currentLocale) || {};
      return _.merge(enUSTexts, localeTexts);
    },
    * getUserProfile({ payload }, { call, put }) {
      yield put({
        type: 'setUserProfile',
        payload: yield call(getUserProfile) as User,
      });
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
  },
  subscriptions: {
    setup({ history }) {},
  },
};

export default AppModel;
