import { ConnectState } from '../../../models';
import { AppState } from '../../../models/app';
import { Dispatch } from '../../../interfaces';
import { connect } from '../../../patches/dva';
import AppPaperContainer from '../../../components/AppPaperContainer';
import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = makeStyles((theme: Theme) => createStyles({
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    paddingTop: 0,
  },
}));

const paperData = {
  'id': 2,
  'public': false,
  'title': '高中生物自测题（一）',
  'missedChoicesScore': 3,
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
  const classes = useStyles();

  return (
    <div className="app-page app-page-exam__answer">
      <main className={clsx(classes.content, 'app-container')}>
        <AppPaperContainer paper={paperData} mode="answer" />
      </main>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(AnswerPage);
