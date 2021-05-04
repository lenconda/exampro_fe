import { getExamInfo } from './service';
import { AppState } from '../../models/app';
import {
  Dispatch,
  ExamAnswerRequestData,
  ExamResponseData,
  ExamResultResponseData,
} from '../../interfaces';
import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import AppIndicator from '../AppIndicator';
import { useTexts } from '../../utils/texts';
import AppPaperContainer from '../AppPaperContainer';
import Card from '@material-ui/core/Card';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import NoteTextIcon from 'mdi-material-ui/NoteText';
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import _ from 'lodash';
import clsx from 'clsx';
import './index.less';

export interface AppExamContainerProps extends PaperProps {
  examId: number;
}
export interface AppExamContainerComponentProps extends AppExamContainerProps, AppState, Dispatch {}
export type ExamState = 'waiting_for_confirmation' | 'processing' | 'resulted' | 'forbidden';

const useStyles = makeStyles((theme) => {
  return {
    examContainerWrapper: {
      padding: theme.spacing(2),
      display: 'flex',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    examInfoWrapper: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: 320,
      padding: theme.spacing(6),
    },
    examInfoTitle: {
      width: '100%',
      textAlign: 'center',
      marginBottom: theme.spacing(3),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    examInfoTitleIcon: {
      marginRight: theme.spacing(1),
    },
    infoItem: {
      marginBottom: theme.spacing(1),
    },
  };
});

const AppExamContainer: React.FC<AppExamContainerComponentProps> = ({
  examId,
  dispatch,
  ...props
}) => {
  const classes = useStyles();
  const texts = useTexts(dispatch, 'examContainer');
  const examEditorTexts = useTexts(dispatch, 'examEditor');
  const systemTexts = useTexts(dispatch, 'system');
  const [exam, setExam] = useState<ExamResponseData>(undefined);
  const [examLoading, setExamLoading] = useState<boolean>(false);
  const [examState, setExamState] = useState<ExamState>('processing');
  const [participantAnswer, setParticipantAnswer] = useState<ExamAnswerRequestData>({});

  const fetchExamInfo = (id: number) => {
    setExamLoading(true);
    getExamInfo(id).then((exam) => {
      setExam(exam);
    }).catch((err) => {
      const statusCode = _.get(err, 'response.status');
      if (statusCode === 403) {
        setExamState('forbidden');
      }
    }).finally(() => setExamLoading(false));
  };

  useEffect(() => {
    if (['forbidden'].indexOf(examState) === -1) {
      fetchExamInfo(examId);
    }
  }, [examId, examState]);

  return (
    <Paper
      elevation={0}
      {...props}
      classes={_.merge(props.classes, {
        root: clsx(classes.examContainerWrapper, _.get(props, 'classes.root')),
      })}
    >
      {
        examLoading
          ? <AppIndicator type="loading" />
          : (
            <>
              {
                examState === 'forbidden' && (<></>)
              }
              {
                examState === 'processing' && (
                  exam
                    ? <AppPaperContainer paper={exam.paper} mode="answer" />
                    : <AppIndicator type="empty" />
                )
              }
              {
                examState === 'waiting_for_confirmation' && (
                  exam
                    ? (
                      <Card classes={{ root: classes.examInfoWrapper }} variant="outlined">
                        <Typography
                          variant="h5"
                          classes={{ root: classes.examInfoTitle }}
                        >
                          <NoteTextIcon color="primary" fontSize="large" classes={{ root: classes.examInfoTitleIcon }} />
                          {exam.title}
                        </Typography>
                        <Typography classes={{ root: classes.infoItem }}>
                          {examEditorTexts['START_TIME']}:&nbsp;{new Date(exam.startTime).toLocaleString()}
                        </Typography>
                        <Typography classes={{ root: classes.infoItem }}>
                          {examEditorTexts['END_TIME']}:&nbsp;{new Date(exam.endTime).toLocaleString()}
                        </Typography>
                        <Typography classes={{ root: classes.infoItem }}>
                          {examEditorTexts['DURATION']}:&nbsp;{exam.duration}
                        </Typography>
                        <Typography classes={{ root: classes.infoItem }}>
                          {examEditorTexts['DELAY']}:&nbsp;{exam.delay}
                        </Typography>
                        <Typography classes={{ root: classes.infoItem }}>
                          {examEditorTexts['IS_PUBLIC']}:&nbsp;{exam.public ? systemTexts['TRUE'] : systemTexts['FALSE']}
                        </Typography>
                        {
                          exam.initiator && (
                            <Typography classes={{ root: classes.infoItem }}>
                              {texts['INITIATOR']}:&nbsp;{exam.initiator.name}&nbsp;({exam.initiator.email})
                            </Typography>
                          )
                        }
                      </Card>
                    )
                    : <AppIndicator type="empty" />
                )
              }
            </>
          )
      }
    </Paper>
  );
};

export default connect(({ app }: ConnectState) => app)(AppExamContainer) as React.FC<AppExamContainerProps>;
