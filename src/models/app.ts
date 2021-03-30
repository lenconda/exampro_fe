import { Effect, Subscription } from 'dva';
import { ConnectState } from '.';
import _ from 'lodash';

export interface I18N {
  [key: string]: {
    errors?: Record<string, string>;
    ui?: {
      [pathname: string]: Record<string, string>;
    };
    avatarDropdown?: Record<string, string>;
    sidebarMenu?: Record<string, string>;
    examRoles?: Record<string, string>;
    table?: Record<string, string>;
    system?: Record<string, string>;
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
    getTexts: Effect;
  };
  reducers: {};
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
          ERR_PASSWORD_NOT_NULL: '无法设置已设置密码的账户的密码',
        },
        avatarDropdown: {
          '001': '个人资料',
          '002': '更新密码',
          '003': '更新邮箱',
          '004': '登出',
        },
        sidebarMenu: {
          'EXAMS': '考试',
          'PAPERS': '试卷',
          'QUESTIONS': '试题',
          'ADMIN': '管理员',
          'ACCOUNT_SETTINGS': '账户',
          'ACCOUNT_SETTINGS/PROFILE': '个人资料',
          'ACCOUNT_SETTINGS/CHANGE_EMAIL': '更新邮箱',
          'ACCOUNT_SETTINGS/CHANGE_PASSWORD': '更新密码',
        },
        examRoles: {
          'resource/exam/initiator': '我发起的',
          'resource/exam/invigilator': '我监考的',
          'resource/exam/maintainer': '参与协作',
          'resource/exam/participant': '我参加的',
          'resource/exam/reviewer': '参与阅卷',
        },
        table: {
          '001': '每页数量',
          '002': '上一页',
          '003': '下一页',
          '004': '条记录中的',
          '005': '没有数据',
          '006': '个项目被选中',
        },
        system: {
          'TRUE': '是',
          'FALSE': '否',
          'OK': '好',
          'CANCEL': '放弃',
          'NULL': '无',
          'DELETE': '删除',
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
          '/user/complete': {
            '001': '密码',
            '002': '确认密码',
            '003': '继续',
            '004': '完善账户信息',
            '005': '请填写密码',
            '006': '请确认密码',
            '007': '完善账户信息成功',
            '008': '正在前往控制台',
            '009': '两次输入密码不一致',
            '010': '姓名',
          },
          '/user/verify_email': {
            '001': '正在验证邮箱',
            '002': '邮箱验证完成',
            '003': '邮箱验证失败',
            '004': '正在前往控制台',
            '005': '请稍后刷新这个页面',
            '006': '请验证邮箱',
            '007': '验证',
          },
          '/home/exams': {
            '001': '查询考试',
            '002': '新建',
            '003': '名称',
            '004': '公开',
            '005': '计算成绩',
            '006': '开始时间',
            '007': '结束时间',
            '008': '时长 (分钟)',
            '009': '不限时',
          },
        },
      },
    },
  },
  effects: {
    * getTexts({ payload }, { select }) {
      const currentI18n: I18N = yield select((state: ConnectState) => state.app.i18n);
      const currentLocale = yield select((state: ConnectState) => state.app.locale);
      const enUSTexts = _.get(currentI18n, 'en_US') || {};
      const localeTexts = _.get(currentI18n, currentLocale) || {};
      return _.merge(enUSTexts, localeTexts);
    },
  },
  reducers: {},
  subscriptions: {
    setup({ history }) {},
  },
};

export default AppModel;
