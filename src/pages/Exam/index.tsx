import { ConnectState } from '../../models';
import { AppState } from '../../models/app';
import { Dispatch } from '../../interfaces';
import { connect } from '../../patches/dva';
import AppExamContainer from '../../components/AppExamContainer';
import React, { useEffect, useState } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { useParams } from 'react-router';
import _ from 'lodash';
import './index.less';

const useStyles = makeStyles((theme: Theme) => createStyles({
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    paddingTop: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 1,
  },
  controlCard: {
    width: 240,
  },
}));

export interface ExamPageProps extends AppState, Dispatch {
  window?: () => Window;
}

const ExamPage: React.FC<ExamPageProps> = ({
  dispatch,
}) => {
  const classes = useStyles();
  const params = useParams();
  const [examId, setExamId] = useState<number>(undefined);

  useEffect(() => {
    const { id } = (params || {}) as Record<string, string>;
    if (id) {
      setExamId(parseInt(id, 10));
    }
  }, [params]);

  return (
    <div className="app-page app-page-exam">
      <main className={clsx(classes.content, 'app-container')}>
        {
          !_.isNumber(examId)
            ? null
            : <AppExamContainer examId={examId} />
        }
      </main>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(ExamPage);
