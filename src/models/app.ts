import { Reducer } from 'redux';
import { Effect, Subscription } from 'dva';
import { ConnectState } from '.';

export interface I18N {
  [key: string]: {
    errors: Record<string, string>;
    ui: {
      [pathname: string]: Record<string, string>;
    };
  };
}

export interface AppState {
  count: number;
  locale: string;
  i18n: I18N;
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
    locale: 'zh_CN',
    i18n: {
      zh_CN: {
        errors: {
          ERR_BODY_EMAIL_REQUIRED: '请输入邮箱',
          ERR_BODY_PASSWORD_REQUIRED: '请输入密码',
          ERR_ACTIVE_CODE_EXPIRED: '验证码超时',
          ERR_ACTIVE_CODE_INVALID: '验证码错误',
          ERR_ACCOUNT_NOT_FOUND: '账户不存在',
          ERR_ACCOUNT_STATUS_INVALID: '账户状态异常',
          ERR_ACCOUNT_REPEATED_ACTIVATION_DETECTED: '账户已激活，禁止重复激活',
          ERR_AUTHENTICATION_FAILED: '账户认证失败',
          ERR_USER_INACTIVE: '账户未激活',
          ERR_EMAIL_DUPLICATED: '邮箱已被占用',
          ERR_ROLE_NOT_FOUND: '角色不存在',
          ERR_MENU_NOT_FOUND: '菜单项不存在',
          ERR_MENU_PARENT_CIRCLED: '无法指定父级目录为自身',
          ERR_ROLE_ID_DUPLICATED: '角色已被占用',
          ERR_QUESTION_MODIFICATION_PROHIBITED: '无权限修改题目',
          ERR_QUESTION_NOT_FOUND: '试题未找到',
          ERR_CHOICES_NOT_ALLOWED: '该试题类型不允许指定选项',
          ERR_USER_PASSWORD_NOT_SET: '请先设置密码',
          ERR_ACCOUNT_EXISTED: '账户已被占用',
          ERR_EMAIL_VERIFICATION_REQUIRED: '请先验证邮箱',
          ERR_NOT_PARTICIPANT: '你不是本场考试的考生',
          ERR_DUPLICATED_CONFIRMATION_PROHIBITED: '无法重复确认已确认的考试',
        },
        ui: {
          '/user/auth': {
            '001': '验证身份',
            '002': '邮箱',
            '003': '密码',
            '004': '继续',
            '005': '我忘记了密码',
            '006': '保持我的登录状态',
            '007': '隐私政策',
            '008': '邮箱地址验证无效',
            '009': '请输入邮箱地址',
            '010': '登录',
            '011': '账户注册成功',
            '012': '已为账户重置密码',
            '013': '请按照账户邮箱中的邮件进行下一步操作',
          },
        },
      },
    },
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
