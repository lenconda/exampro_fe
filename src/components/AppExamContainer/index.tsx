import { getExamInfo, submitParticipantAnswer } from './service';
import { AppState } from '../../models/app';
import {
  Dispatch,
  ExamAnswerRequestData,
  ExamResponseData,
  ExamResultResponseData,
  PaperQuestionResponseData,
} from '../../interfaces';
import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import AppIndicator from '../AppIndicator';
import { useTexts } from '../../utils/texts';
import AppPaperContainer from '../AppPaperContainer';
import { getQuestionAnswerStatus } from '../../utils/question';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Checkbox from '@material-ui/core/Checkbox';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import NoteTextIcon from 'mdi-material-ui/NoteText';
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import _ from 'lodash';
import clsx from 'clsx';
import parseISO from 'date-fns/parseISO';
import isAfter from 'date-fns/isAfter';
import formatDistanceToNowStrict from 'date-fns/formatDistanceToNowStrict';
import './index.less';

export const getDistanceString = (dateString) => {
  const formatDistance = ({ days, hours, minutes, seconds }) => [
    days,
    ...[hours % 24, minutes % 60, seconds % 60].map(s => `${s}`.padStart(2, '0')),
  ].join(':');

  const UNITS = ['day', 'hour', 'minute', 'second'];
  const date = parseISO(dateString);

  let result = { days: 0, hours: 0, minutes: 0, seconds: 0 };

  if (!isAfter(new Date(), date)) {
    const [days, hours, minutes, seconds] = UNITS.map((unit: any) => formatDistanceToNowStrict(date, {
      unit,
      roundingMethod: 'floor',
    }).replace(/\D/g, '')).map((item) => parseInt(item, 10));

    result = { days, hours, minutes, seconds };
  }

  return formatDistance(result);
};

export interface AppExamContainerProps extends PaperProps {
  examId: number;
}
export interface AppExamContainerComponentProps extends AppExamContainerProps, AppState, Dispatch {}
export type ExamState = 'waiting_for_confirmation' | 'processing' | 'submitted' | 'resulted' | 'forbidden';

const useStyles = makeStyles((theme) => {
  return {
    examContainerWrapper: {
      padding: theme.spacing(2),
      justifyContent: 'center',
      backgroundColor: 'transparent',
      overflowY: 'scroll',
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
    examPaperWrapper: {
      paddingLeft: theme.spacing(32),
    },
    controlCard: {
      position: 'fixed',
      top: theme.spacing(7),
      left: theme.spacing(4),
      width: 320,
      userSelect: 'none',
    },
    timer: {
      width: '100%',
      textAlign: 'center',
    },
    controlCardInfoContent: {
      textAlign: 'center',
      '& > img': {
        marginBottom: theme.spacing(3),
      },
    },
    controlCardProgressWrapper: {},
    questionAnswerStatusesWrapper: {
      display: 'flex',
      flexWrap: 'wrap',
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
  const [paperQuestionLoaded, setPaperQuestionLoaded] = useState<boolean>(false);
  const [paperQuestions, setPaperQuestions] = useState<PaperQuestionResponseData[]>([]);
  const [submitAnswerLoading, setSubmitAnswerLoading] = useState<boolean>(false);
  const [timerUnlocked, setTimerUnlocked] = useState<boolean>(false);
  const [timerString, setTimerString] = useState<string>('00:00:00');

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

  const submitAnswer = (examId: number, answer: ExamAnswerRequestData) => {
    setSubmitAnswerLoading(true);
    submitParticipantAnswer(examId, answer).then(() => {
      setExamState('submitted');
    }).finally(() => setSubmitAnswerLoading(false));
  };

  useEffect(() => {
    if (['forbidden'].indexOf(examState) === -1) {
      fetchExamInfo(examId);
    }
  }, [examId, examState]);

  useEffect(() => {
    let timer;

    if (exam) {
      if (timerUnlocked && examState === 'processing') {
        timer = setInterval(() => {
          const distance = getDistanceString(exam.endTime);
          setTimerString(distance);
        }, 1000);
      }
      const endTimestamp = Date.parse(exam.endTime);
      const currentTimestamp = Date.now();
      if (endTimestamp - currentTimestamp <= 0) {
        submitAnswer(exam.id, participantAnswer);
        clearInterval(timer);
      }
    }

    return () => clearInterval(timer);
  }, [timerUnlocked, examState, exam]);

  return (
    <Paper
      elevation={0}
      {...props}
      classes={_.merge(props.classes, {
        root: clsx(classes.examContainerWrapper, _.get(props, 'classes.root')),
      })}
    >
      {
        (examState === 'processing' && !examLoading && exam && paperQuestionLoaded) && (
          <Card classes={{ root: classes.controlCard }}>
            <CardContent classes={{ root: classes.controlCardInfoContent }}>
              <img src="/assets/images/logo_text.svg" width="42%" />
              <Tooltip title={exam.title}>
                <Typography
                  gutterBottom={true}
                  color="textSecondary"
                >{exam.title}</Typography>
              </Tooltip>
              <Typography
                variant="h2"
                classes={{ root: classes.timer }}
                gutterBottom={true}
              >{timerString}</Typography>
            </CardContent>
            <CardContent classes={{ root: classes.controlCardProgressWrapper }}>
              <Box className={classes.questionAnswerStatusesWrapper}>
                {
                  paperQuestions.map((paperQuestion) => {
                    const id = _.get(paperQuestion, 'question.id') as number;
                    const questionAnswerStatus = getQuestionAnswerStatus(paperQuestion.question, participantAnswer[id.toString()]);
                    return (
                      <Checkbox
                        key={id}
                        color="primary"
                        checked={questionAnswerStatus !== 'nil'}
                        indeterminate={questionAnswerStatus === 'partial'}
                      />
                    );
                  })
                }
              </Box>
            </CardContent>
            <CardContent>
              <Button
                color="primary"
                variant="contained"
                disabled={submitAnswerLoading}
                fullWidth={true}
                onClick={() => submitAnswer(exam.id, participantAnswer)}
              >{texts['SUBMIT']}</Button>
            </CardContent>
          </Card>
        )
      }
      <Box>
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
                      ? (
                        <Box className={classes.examPaperWrapper}>
                          <AppPaperContainer
                            paper={exam.paper}
                            mode="answer"
                            onAnswerChange={(paper, answer) => setParticipantAnswer(answer)}
                            onPaperQuestionLoaded={(loadedPaperQuestions) => {
                              setPaperQuestionLoaded(true);
                              setPaperQuestions(loadedPaperQuestions);
                              setTimerUnlocked(true);
                            }}
                            onPaperQuestionLoading={() => setPaperQuestionLoaded(false)}
                          />
                        </Box>
                      )
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
      </Box>
    </Paper>
  );
};

export default connect(({ app }: ConnectState) => app)(AppExamContainer) as React.FC<AppExamContainerProps>;
