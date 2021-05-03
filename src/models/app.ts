import { ConnectState } from '.';
import { ExamStatus } from '../pages/Home/Exams/service';
import { User } from '../interfaces';
import { getUserProfile } from '../pages/Home/service';
import { Effect, Subscription } from 'dva';
import _ from 'lodash';
import { Reducer } from 'redux';

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
    examStatuses?: Record<ExamStatus, string>;
    dialog?: Record<string, string>;
    examCard?: Record<string, string>;
    editor?: Record<string, string>;
    questionEditor?: Record<string, string>;
    questionItem?: Record<string, string>;
    searchBar?: Record<string, string>;
    paperEditor?: Record<string, string>;
    paperQuestionItem?: Record<string, string>;
    examEditor?: Record<string, string>;
    dateTimePicker?: Record<string, string>;
  };
}

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
    i18n: {
      'zh-CN': {
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
        dialog: {
          'CONFIRM': '好',
          'PROMPT': '提示',
          'WARN': '警告',
        },
        examStatuses: {
          'PREPARING': '未开始',
          'IN_PROGRESS': '进行中',
          'FINISHED': '已结束',
        },
        table: {
          '001': '每页数量',
          '002': '上一页',
          '003': '下一页',
          '004': '条记录中的',
          '005': '没有数据',
          '006': '个项目被选中',
        },
        examCard: {
          '001': '开始时间',
          '002': '截止时间',
          '003': '限时 (分钟)',
          '004': '未命名考试',
          '005': '不限时',
          '006': '无限制',
          '007': '进入考试',
          '008': '查询成绩',
        },
        system: {
          'TRUE': '是',
          'FALSE': '否',
          'OK': '好',
          'CANCEL': '放弃',
          'SAVE_DRAFT': '保存草稿',
          'NULL': '无',
          'DELETE': '删除',
          'EMPTY': '没有数据',
          'LOAD_MORE': '加载更多',
          'SUBMIT': '提交',
          'SUBMITTING': '提交中...',
          'LOADING': '加载中',
          'EDIT': '编辑',
          'CLOSE': '关闭',
          'CLEAR': '清空',
        },
        editor: {
          'header-one': '标题 1',
          'header-two': '标题 2',
          'header-three': '标题 3',
          'header-four': '标题 4',
          'header-five': '标题 5',
          'header-six': '标题 6',
          'header-paragraph': '正文',
          'blockquote': '引用块',
          'unordered-list-item': '无序列表',
          'ordered-list-item': '有序列表',
          'code-block': '代码块',
          'BOLD': '粗体',
          'ITALIC': '斜体',
          'UNDERLINE': '下划线',
          'CODE': '行内代码',
          'STRIKETHROUGH': '中划线',
          'CANCEL': '放弃',
          'OK': '好',
          'CLICK_TO_UPLOAD': '单击此处以上传图片',
          'IMAGE_UPLOADING': '图片上传中...',
          'EQUATION_CONTENT': '公式内容',
          'USE_BLOCK_EQUATION': '另起一行',
          'ADD_LINK': '添加链接',
          'UPLOAD_IMAGE': '上传图片',
          'FUNCTIONS': '数学公式',
          'UNDO': '撤销',
          'REDO': '重做',
        },
        questionEditor: {
          'EDIT_QUESTION': '编辑试题',
          'TYPE_SINGLE_CHOICE': '单项选择',
          'TYPE_MULTIPLE_CHOICES': '多项选择',
          'TYPE_FILL_IN_BLANK': '填空',
          'TYPE_SHORT_ANSWER': '简答',
          'TYPE': '试题类型',
          'CHOICES': '试题选项',
          'CREATE_CHOICE': '创建选项',
          'INPUT_HERE': '在此键入选项内容...',
          'SELECT_ANSWERS': '设置答案',
          'CLOSE': '关闭',
          'IS_ANSWER': '答案',
          'DELETE_CHOICE': '删除选项',
          'DELETE_ANSWER': '删除答案',
          'ADD_BLANK_ANSWER': '添加答案',
          'SUBMITTING': '提交中',
          'QUESTION_CONTENT': '题干内容',
          'QUESTION_CATEGORY': '题目分类',
        },
        paperEditor: {
          'TITLE': '编辑试卷',
          'BASE_SETTINGS': '基础设置',
          'MAINTAINER': '协作人员',
          'QUESTIONS': '试题',
          'ENTER_TITLE': '试卷标题',
          'ADD_QUESTION': '添加试题',
          'SELECT_QUESTIONS': '选择试题',
          'MISS_CHOICE_POINTS': '多选题漏选得分',
          'POINTS': '分数',
          'IS_PUBLIC': '公开试卷',
        },
        paperQuestionItem: {
        },
        examEditor: {
          'TITLE': '编辑考试',
          'BASIC_SETTINGS': '基础设置',
          'MAINTAINER': '协作人员',
          'INVIGILATOR': '监考员',
          'REVIEWER': '阅卷人',
          'PARTICIPANT': '考生',
          'START_TIME': '开始时间',
          'END_TIME': '截止时间',
          'DURATION': '考试时长（分钟）',
          'EXAM_TITLE': '考试标题',
          'DELAY': '延迟开始时间（分钟）',
          'IS_PUBLIC': '公开考试',
          'NOTIFY_PARTICIPANTS': '通知参与考生',
          'SELECT_PAPER': '选择试卷',
          'MAINTAINED': '协作',
        },
        questionItem: {
          'IS_ANSWER': '答案',
          'CHOICES': '选项',
          'EXPAND': '展开',
          'COLLAPSE': '收起',
          'SINGLE_CHOICE': '单项选择',
          'MULTIPLE_CHOICES': '多项选择',
          'SHORT_ANSWER': '简答',
          'FILL_IN_BLANK': '填空',
          'SURE_TO_DELETE': '将要删除这个试题',
        },
        searchBar: {
          'CREATE': '新建',
          'INPUT_TO_QUERY': '在此键入内容以查询...',
        },
        dateTimePicker: {
          'INVALID_DATE': '无效的日期格式',
          'MAX_DATE': '日期不应在最大日期之后',
          'MIN_DATE': '日期不应在最小日期之前',
          'TODAY': '今天',
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
            '010': '删除',
            '011': '编辑考试',
            '012': '监考',
            '013': '状态',
            '014': '是否确定删除考试：',
          },
          '/home/questions': {
            '001': '查询试题',
            '002': '新建',
            '003': '所有类别',
          },
          '/home/papers': {
            'resource/paper/owner,resource/paper/maintainer': '全部',
            'resource/paper/owner': '仅创建的',
            'resource/paper/maintainer': '仅参与协作的',
            '004': '标题',
            '005': '创建人',
            '006': '创建日期',
            '007': '最近修改日期',
            '008': '以下考试将会被删除',
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
  },
  subscriptions: {
    setup({ history }) {},
  },
};

export default AppModel;
