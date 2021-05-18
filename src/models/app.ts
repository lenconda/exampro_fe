import { ConnectState } from '.';
import { ExamStatus, User } from '../interfaces';
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
    paperContainer?: Record<string, string>;
    examContainer?: Record<string, string>;
    roleSelector?: Record<string, string>;
    roleAutocomplete?: Record<string, string>;
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
          ERR_OLD_PASSWORD_MISMATCHED: '旧密码不正确',
        },
        avatarDropdown: {
          '001': '个人资料',
          '002': '更新邮箱',
          '003': '我的考试',
          '004': '试卷管理',
          '005': '考试题库',
          '006': '登出',
        },
        sidebarMenu: {
          'EXAMS': '考试',
          'PAPERS': '试卷',
          'QUESTIONS': '试题',
          'ADMIN': '管理员',
          'ADMIN/ROLE_MANAGE': '角色配置',
          'ADMIN/MENU_MANAGE': '菜单配置',
          'ADMIN/USER_MANAGE': '账户管理',
          'ADMIN/DYNAMIC_CONFIG': '动态配置中心',
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
          'FINISHED': '待批阅',
          'RESULTED': '已结束',
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
          'CREATE_NEW': '新建',
          'EXAM': '考试',
          'PAPER': '试卷',
          'QUESTION': '试题',
          'TRUE': '是',
          'FALSE': '否',
          'OK': '好',
          'CANCEL': '放弃',
          'SAVE_DRAFT': '保存草稿',
          'NULL': '无',
          'DELETE': '删除',
          'DELETING': '删除中...',
          'EMPTY': '没有数据',
          'LOAD_MORE': '加载更多',
          'SUBMIT': '提交',
          'SUBMITTING': '提交中...',
          'LOADING': '加载中',
          'EDIT': '编辑',
          'CLOSE': '关闭',
          'CLEAR': '清空',
          'NOT_READY': '操作暂时不被允许',
          'OPERATIONS': '操作',
          'REVIEW': '阅卷',
          'SAVE': '保存',
          'SAVING': '保存中...',
          'SAVED_SUCCESSFULLY': '保存成功',
          'UPDATE': '更新',
          'UPDATING': '更新中',
          'UPDATED_SUCCESSFULLY': '更新成功',
          'RESET': '重置',
          'LOGOUT': '登出',
          'FORBIDDEN': '没有权限',
          'GRANT': '授权角色',
          'REVOKE': '解除授权',
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
          'RESULT_TIME': '出分时间（可选）',
          'DURATION': '考试时长（分钟）',
          'EXAM_TITLE': '考试标题',
          'DELAY': '延迟开始时间（分钟）',
          'IS_PUBLIC': '公开考试',
          'NOTIFY_PARTICIPANTS': '通知参与考生',
          'SELECT_PAPER': '选择试卷',
          'MAINTAINED': '协作',
          'PARTICIPANT_MESSAGE': '输入考生邮箱地址，每个邮箱地址之间使用 \',\' 分隔。未注册的邮箱地址将会自动注册。',
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
          'STANDARD_ANSWER': '标准答案',
          'PARTICIPANT_ANSWER': '考生答案',
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
        paperContainer: {
          'POINTS': '满分',
          'SCORE': '得分',
          'INPUT_SCORE': '输入得分',
        },
        examContainer: {
          'INITIATOR': '发起人',
          'SUBMIT': '交卷',
          'EXAM_ANSWER_SUBMITTED': '试卷答案已提交',
          'SUBMITTED_MESSAGE': '考试结束后，可在「主页-考试-我参加的」页面中查询本场考试的成绩。现在，你可以单击「返回主页」按钮回到主页',
          'GO_BACK': '返回主页',
          'NO_PRIVILEGE': '没有权限',
          'NO_PRIVILEGE_MESSAGE': '你没有权限访问、管理、参加这场考试。这通常是由于考试的发起人或管理员没有将你列入考试相关人员名单中，或你已经提交该场考试的答案',
          'SUBMIT_SCORE': '提交成绩',
          'SUBMIT_SUCCESSFULLY': '考生成绩提交成功，5秒后跳转至主页',
          'START_EXAM': '开始考试',
          'CANNOT_START_EXAM': '无法开始考试',
          'CANNOT_START_EXAM_REASONS': '你暂时没有获得进入这场考试的许可，原因可能是：<br />1. 当前时间未处在考试时间范围内<br />2. 你已参加过该考试<br />3. 你的设备不支持摄像头',
          'NOTES': '考试须知',
          'NOTES_CONTENT': '1. 考试期间禁止离开浏览器页面<br />2. 考试期间请不要刷新浏览器页面',
          'NOT_READY': '操作暂时不被允许',
          'NOT_READY_MESSAGE': '你暂未获得该项操作的许可，这是因为当前时间没有处在操作许可的时间范围内。现在，你可以单击「返回主页」按钮回到主页',
          'PROGRESS': '答题进展',
          'SURE_TO_SUBMIT': '确定要提交考试答案吗？',
          'FRAUD_MARKED_TITLE': '被标记为舞弊',
          'FRAUD_MARKED_MESSAGE': '你在这场考试过程中被监考人员判定存在舞弊行为。即使你的单个试题可能有得分，但总成绩依然为0。',
        },
        roleSelector: {
          'TITLE': '选择一个或多个角色',
        },
        roleAutocomplete: {
          'SELECT_ROLES': '选择角色',
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
            '014': '以下考试将会被删除',
            '015': '批阅',
          },
          '/home/questions': {
            '001': '查询试题',
            '002': '新建',
            '003': '所有类别',
            '004': '添加到试卷...',
            '005': '将要删除所有所选的试题',
            '006': '查询试卷',
            '007': '组卷...',
          },
          '/home/papers': {
            'resource/paper/owner,resource/paper/maintainer': '全部',
            'resource/paper/owner': '仅创建的',
            'resource/paper/maintainer': '仅参与协作的',
            '004': '标题',
            '005': '创建人',
            '006': '创建日期',
            '007': '最近修改日期',
            '008': '以下试卷将会被删除',
          },
          '/home/exams/review_list': {
            '001': '返回',
            '002': '手动刷新',
            '003': '头像',
            '004': '昵称',
            '005': '邮箱',
            '006': '开始时间',
            '007': '提交时间',
            '008': '刷新中...',
          },
          '/home/exams/invigilate': {
            '001': '返回',
            '002': '手动刷新',
            '003': '头像',
            '004': '昵称',
            '005': '邮箱',
            '006': '开始时间',
            '007': '刷新中...',
            '008': '离开次数',
            '009': '已被标记舞弊',
            '010': '实时摄像头',
            '011': '实时屏幕',
            '012': '判定舞弊',
            '013': '撤销判定舞弊',
            '014': '确定要将该账户标记为「在本场考试中存在舞弊行为」吗？',
            '015': '确定要将该账户的「在本场考试中存在舞弊行为」标记撤销吗？',
          },
          '/home/account/profile': {
            '001': '更换头像',
            '002': '昵称/姓名',
            '003': '旧密码',
            '004': '新密码',
            '005': '确认密码',
            '006': '两次输入密码不一致',
          },
          '/home/account/change_email': {
            '001': '新邮箱',
            '002': '新的邮箱地址已设置',
            '003': '你的新邮箱地址已被成功设置，你的登录状态已被解除，将在5秒内退回至认证页面。你现在也可以通过单击下方的「登出」按钮执行这一步骤。此外，你的新邮箱还会接收一封新邮件用于验证，请尽快操作',
          },
          '/home/admin/menu': {
            '001': '添加',
            '002': '选择一个菜单项，开始配置它的详细信息',
            '003': '创建新的菜单项',
            '004': '唯一标题（不可更改）',
            '005': '图标',
            '006': '相对路径',
            '007': '确定要删除这个菜单项吗？与它相关联的所有子级菜单项也将会被一并删除',
            '008': 'ID',
            '009': '授权时间',
            '010': '确定要解除授予这个角色访问这个菜单项的权限吗？',
            'BASIC': '基础配置',
            'ROLES': '角色配置',
            'MOVE_LEFT': '左移',
            'MOVE_RIGHT': '右移',
          },
          '/home/admin/user': {
            '001': '添加账户',
            '002': '选择一个用户，开始查看详细信息和配置角色',
            '003': 'ID',
            '004': '授权时间',
            '005': '确定要解除授予这个角色吗？',
            '006': '邮箱',
            '007': '昵称',
            '008': '加入时间',
            '009': '添加账户',
            '010': '键入信息以查询',
            'BASIC': '基础信息',
            'ROLES': '角色配置',
          },
          '/home/admin/role': {
            '001': '所有角色',
            '002': '添加子角色',
            '003': '选择一个角色，开始配置角色信息',
            '004': 'ID',
            '005': '确定要删除这个角色吗？与它相关联的所有子级角色也将会被一并删除',
            '006': '角色ID',
            '007': '作为叶子节点',
          },
          '/home/admin/dynamic': {
            '001': '键入信息以查询',
            '002': '新建配置项',
            '003': '配置项内容（JSON）',
            '004': '配置项路径',
            '005': '编辑配置项',
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
