import { ConnectState } from '../../../models';
import { AppState } from '../../../models/app';
import { Dispatch, SidebarMenuItem, User } from '../../../interfaces';
import { useTexts } from '../../../utils/texts';
import { connect } from '../../../patches/dva';
import AppPaperContainer from '../../../components/AppPaperContainer';
import React, { useState, Suspense, useEffect } from 'react';
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import clsx from 'clsx';
import { useHistory } from 'react-router';

const useStyles = makeStyles((theme: Theme) => createStyles({
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    paddingTop: 0,
  },
}));

const paperData = {
  'id': 1,
  'public': false,
  'title': '南昌二中高二物理单元测试卷',
  'missedChoicesScore': 0,
  'banned': false,
  'createdAt': '2021-05-02T12:46:00.297Z',
  'updatedAt': '2021-05-03T05:14:38.000Z',
  'deletedAt': null,
  'creator': {
    'email': 'lenconda@foxmail.com',
    'avatar': '/assets/images/default_avatar.jpg',
    'verifying': false,
    'name': '彭瀚林',
    'createdAt': '2021-04-30T02:46:27.043Z',
    'updatedAt': '2021-04-30T02:48:00.000Z',
    'deletedAt': null,
  },
  'role': {
    'id': 'resource/paper/owner',
    'description': null,
    'order': 1,
    'createdAt': '2021-04-30T02:45:53.355Z',
    'updatedAt': '2021-04-30T02:45:53.355Z',
    'deletedAt': null,
  },
};

export interface AnswerPageProps extends AppState, Dispatch {
  window?: () => Window;
}

const AnswerPage: React.FC<AnswerPageProps> = ({
  dispatch,
  ...props
}) => {
  const { window } = props;
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const dropdownTexts = useTexts(dispatch, 'avatarDropdown');
  const sidebarMenuTexts = useTexts(dispatch, 'sidebarMenu');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const container = window !== undefined
    ? () => window().document.body
    : undefined;

  return (
    <div className="app-page app-page-exam__answer">
      <main className={clsx(classes.content, 'app-container')}>
        <AppPaperContainer paper={paperData} />
      </main>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(AnswerPage);
