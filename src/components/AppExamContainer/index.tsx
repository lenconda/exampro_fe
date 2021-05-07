import {
  getExamInfo,
  getExamResult,
  getParticipantExamResult,
  putParticipantExamScores,
  startExam,
  submitParticipantAnswer,
} from './service';
import { AppState } from '../../models/app';
import {
  Dispatch,
  ExamAnswerRequestData,
  ExamResponseData,
  ExamResultMetadata,
  ExamResultResponseData,
  AnswerScoreStatus,
  PaperQuestionResponseData,
  QuestionAnswerResponseData,
  User,
} from '../../interfaces';
import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import AppIndicator from '../AppIndicator';
import { useTexts } from '../../utils/texts';
import AppPaperContainer from '../AppPaperContainer';
import { getQuestionAnswerStatus } from '../../utils/question';
import { pushSearch, useLocationQuery } from '../../utils/history';
import {
  calculateExamParticipantTotalScore,
  checkExamParticipantScoresStatus,
  checkParticipantQualification,
  checkResultPermission,
  checkReviewPermission,
} from '../../utils/exam';
import { getUserProfile } from '../../service';
import AppAlertManager from '../AppAlert/Manager';
import AppUserCard from '../AppUserCard';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
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
import EmoticonCryOutline from 'mdi-material-ui/EmoticonCryOutline';
import TextBoxCheckOutline from 'mdi-material-ui/TextBoxCheckOutline';
import _ from 'lodash';
import clsx from 'clsx';
import parseISO from 'date-fns/parseISO';
import isAfter from 'date-fns/isAfter';
import formatDistanceToNowStrict from 'date-fns/formatDistanceToNowStrict';
import './index.less';
import { useHistory } from 'react-router';

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
export type ExamState =
  'waiting_for_confirmation'
  | 'processing'
  | 'submitted'
  | 'reviewing'
  | 'not_ready'
  | 'resulted'
  | 'forbidden';

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
    userItem: {
      display: 'flex',
      alignItems: 'center',
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
    scores: {
      width: '100%',
      textAlign: 'center',
      marginBottom: 0,
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
    mainContent: {
    },
  };
});

const AppExamContainer: React.FC<AppExamContainerComponentProps> = ({
  examId,
  dispatch,
  ...props
}) => {
  const classes = useStyles();
  const history = useHistory();
  const action = useLocationQuery('action') as string;
  const participantEmail = useLocationQuery('participant_email') as string;
  const texts = useTexts(dispatch, 'examContainer');
  const examEditorTexts = useTexts(dispatch, 'examEditor');
  const systemTexts = useTexts(dispatch, 'system');
  const [exam, setExam] = useState<ExamResponseData>(undefined);
  const [examLoading, setExamLoading] = useState<boolean>(false);
  const [examState, setExamState] = useState<ExamState>(undefined);
  const [participantAnswer, setParticipantAnswer] = useState<ExamAnswerRequestData>({});
  const [paperQuestionLoaded, setPaperQuestionLoaded] = useState<boolean>(false);
  const [paperQuestions, setPaperQuestions] = useState<PaperQuestionResponseData[]>([]);
  const [submitAnswerLoading, setSubmitAnswerLoading] = useState<boolean>(false);
  const [timerUnlocked, setTimerUnlocked] = useState<boolean>(false);
  const [timerString, setTimerString] = useState<string>('00:00:00');
  const [examResult, setExamResult] = useState<ExamResultResponseData>({});
  const [examResultLoading, setExamResultLoading] = useState<boolean>(false);
  const [gradeInfo, setGradeInfo] = useState<ExamResultMetadata>(undefined);
  const [submitScoreLoading, setSubmitScoreLoading] = useState<boolean>(false);
  const [startExamLoading, setStartExamLoading] = useState<boolean>(false);
  const [participant, setParticipant] = useState<User>(undefined);

  const fetchExamInfo = (id: number, action?: string) => {
    if (action) {
      setExamLoading(true);
      getExamInfo(id, action).then((exam) => {
        setExam(exam);
      }).catch((err) => {
        const statusCode = _.get(err, 'response.status');
        if (statusCode === 403) {
          setExamState('forbidden');
        }
      }).finally(() => setExamLoading(false));
    }
  };

  const fetchParticipantExamResult = (id: number, email?: string) => {
    setExamResultLoading(true);
    const request = email ? getParticipantExamResult(id, email) : getExamResult(id);
    request.then((result) => {
      setExamResult(result);
    }).finally(() => setExamResultLoading(false));
  };

  const submitAnswer = (examId: number, answer: ExamAnswerRequestData) => {
    setSubmitAnswerLoading(true);
    submitParticipantAnswer(examId, answer).then(() => {
      history.push(pushSearch(history, {
        action: 'submitted',
      }));
    });
  };

  const startParticipantExam = (examId: number) => {
    setStartExamLoading(true);
    startExam(examId).then(() => {
      setExamState('processing');
    }).catch((err) => {
      if (_.get(err, 'response.status') === 403) {
        history.push(pushSearch(history, {
          action: 'not_ready',
        }));
      }
    }).finally(() => setStartExamLoading(false));
  };

  const fetchParticipantInfo = (email: string) => {
    getUserProfile(email).then((info) => setParticipant(info));
  };

  const submitParticipantScore = (
    examId: number,
    result: ExamResultResponseData,
    participantEmail: string,
  ) => {
    if (!participantEmail) { return }
    setSubmitScoreLoading(true);
    putParticipantExamScores(examId, participantEmail, Object.keys(result).reduce((score, currentQuestionId) => {
      return {
        ...score,
        [currentQuestionId]: result[currentQuestionId].scores,
      };
    }, {})).then(() => {
      AppAlertManager.create(texts['SUBMIT_SUCCESSFULLY'], {
        variant: 'success',
      });
      setTimeout(() => {
        history.replace('/');
      }, 5000);
    }).finally(() => setSubmitScoreLoading(false));
  };

  useEffect(() => {
    if (['forbidden'].indexOf(examState) === -1) {
      fetchExamInfo(examId, action);
    }
    if (examState === 'resulted') {
      fetchParticipantExamResult(examId, participantEmail);
    }
    if (examState === 'reviewing' && participantEmail) {
      fetchParticipantExamResult(examId, participantEmail);

    }
    if (examState === 'reviewing') {
      if (participantEmail) {
        fetchParticipantInfo(participantEmail);
      }
    }
  }, [examId, examState, action]);

  useEffect(() => {
    if (examState === 'resulted' && examResult) {
      setGradeInfo(calculateExamParticipantTotalScore(examResult));
    }
    if (examState === 'reviewing' && examResult) {
      const automaticScores = Object.keys(examResult).reduce((accumulator, currentQuestionId) => {
        const currentQuestionResult = examResult[currentQuestionId];
        const currentPaperQuestion = paperQuestions.find((paperQuestion) => {
          return paperQuestion.question.id === parseInt(currentQuestionId, 10);
        });
        const currentQuestion = _.get(currentPaperQuestion, 'question');
        let scoreStatus: AnswerScoreStatus = 'ignore';
        if (currentQuestion && currentQuestionResult) {
          const { type } = currentQuestion;
          const { scores, answer } = currentQuestionResult;
          if (scores && _.isNumber(scores)) {
            scoreStatus = 'ignore';
          } else {
            const answerChoices = (_.get(currentPaperQuestion, 'question.answers') || []) as QuestionAnswerResponseData;
            if (type === 'single_choice') {
              if (!answer || !_.isArray(answer) || answer.length !== 1) {
                scoreStatus = 'nil';
              } else {
                const [participantChoice] = answer;
                const [answerChoiceItem] = answerChoices;
                const answerChoice = _.get(answerChoiceItem, 'content');
                if (!answerChoice) {
                  scoreStatus = 'ignore';
                }
                if (participantChoice === answerChoice) {
                  scoreStatus = 'full';
                } else {
                  scoreStatus = 'nil';
                }
              }
            } else if (type === 'multiple_choices') {
              if (!answer || !_.isArray(answer)) {
                scoreStatus = 'nil';
              } else {
                const participantAnswers = Array.from(answer);
                const standardAnswerItems = Array.from(answerChoices);
                const standardAnswers = standardAnswerItems.map((item) => item.content);
                const incorrectChoices = _.difference(participantAnswers, standardAnswers);
                if (standardAnswerItems.length === 0) {
                  scoreStatus = 'ignore';
                } else {
                  // eslint-disable-next-line max-depth
                  if (incorrectChoices.length > 0) {
                    scoreStatus = 'nil';
                  } else if (participantAnswers.length === standardAnswers.length) {
                    scoreStatus = 'full';
                  } else {
                    scoreStatus = 'partial';
                  }
                }
              }
            } else {
              scoreStatus = 'ignore';
            }
          }
        } else {
          scoreStatus = 'ignore';
        }
        switch (scoreStatus) {
        case 'full': {
          return {
            ...accumulator,
            [currentQuestionId.toString()]: {
              ...currentQuestionResult,
              scores: currentPaperQuestion.points,
            },
          };
        }
        case 'partial': {
          return {
            ...accumulator,
            [currentQuestionId.toString()]: {
              ...currentQuestionResult,
              scores: _.get(exam, 'paper.missedChoicesScore') || 0,
            },
          };
        }
        case 'nil': {
          return {
            ...accumulator,
            [currentQuestionId.toString()]: {
              ...currentQuestionResult,
              scores: 0,
            },
          };
        }
        default: {
          return { ...accumulator };
        }
        }
      }, {});
      if (Object.keys(automaticScores).length > 0) {
        setExamResult(_.merge(examResult, automaticScores));
      }
    }
  }, [examResult, examState, paperQuestions]);

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
      if (endTimestamp - currentTimestamp <= 0 && examState === 'processing') {
        submitAnswer(exam.id, participantAnswer);
        clearInterval(timer);
      }
    }

    return () => clearInterval(timer);
  }, [timerUnlocked, examState, exam]);

  useEffect(() => {
    if (action === 'result') {
      if (examResult && !examResultLoading) {
        if (checkExamParticipantScoresStatus(examResult) && (exam && checkResultPermission(exam))) {
          setExamState('resulted');
        } else {
          setExamState('not_ready');
        }
      }
    } else if (action === 'review') {
      if (exam && checkReviewPermission(exam)) {
        setExamState('reviewing');
      } else {
        setExamState('not_ready');
      }
    } else if (action === 'participate_confirm') {
      setExamState('waiting_for_confirmation');
    } else if (action === 'participate') {
      if (exam) {
        if (checkParticipantQualification(exam)) {
          setExamState('processing');
        } else {
          history.push(pushSearch(history, {
            action: 'not_ready',
          }));
        }
      }
    } else if (action === 'submitted') {
      setExamState('submitted');
    } else if (action === 'not_ready') {
      setExamState('not_ready');
    }
  }, [exam, action, examResult]);

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
      {
        (examState === 'resulted' && exam && gradeInfo) && (
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
                classes={{ root: classes.scores }}
                gutterBottom={true}
              >{gradeInfo.totalScore || '--'}<small>/{gradeInfo.totalPoints}</small></Typography>
              {
                gradeInfo.percentage && (
                  <Typography
                    variant="h6"
                    color="textSecondary"
                  >{gradeInfo.percentage}%</Typography>
                )
              }
            </CardContent>
          </Card>
        )
      }
      {
        (examState === 'reviewing' && exam) && (
          <Card classes={{ root: classes.controlCard }}>
            <CardContent classes={{ root: classes.controlCardInfoContent }}>
              <img src="/assets/images/logo_text.svg" width="42%" />
              <Tooltip title={exam.title}>
                <Typography
                  gutterBottom={true}
                  color="textSecondary"
                >{exam.title}</Typography>
              </Tooltip>
              {
                participant && (
                  <AppUserCard user={participant} />
                )
              }
            </CardContent>
            <CardContent>
              <Button
                color="primary"
                fullWidth={true}
                variant="contained"
                disabled={!checkExamParticipantScoresStatus(examResult) || submitScoreLoading}
                onClick={() => submitParticipantScore(examId, examResult, participantEmail)}
              >{texts['SUBMIT_SCORE']}</Button>
            </CardContent>
          </Card>
        )
      }
      <Box
        className={clsx({
          [classes.mainContent]: ['result', 'processing', 'review'].indexOf(examState) !== -1,
        })}
      >
        {
          examLoading
            ? <AppIndicator type="loading" />
            : (
              <>
                {
                  examState === 'forbidden' && (
                    <Card elevation={0} classes={{ root: 'card' }}>
                      <img src="/assets/images/logo_text.svg" width="42%" />
                      <Card classes={{ root: 'card-body' }} variant="outlined">
                        <Typography classes={{ root: 'title' }}>
                          <EmoticonCryOutline color="primary" fontSize="large" classes={{ root: 'icon' }} />
                          {texts['NO_PRIVILEGE']}
                        </Typography>
                        <CardContent>
                          <Typography gutterBottom={true}>{texts['NO_PRIVILEGE_MESSAGE']}</Typography>
                        </CardContent>
                        <CardContent>
                          <Button
                            fullWidth={true}
                            variant="outlined"
                            onClick={() => history.push('/')}
                          >{texts['GO_BACK']}</Button>
                        </CardContent>
                      </Card>
                    </Card>
                  )
                }
                {
                  examState === 'not_ready' && (
                    <Card elevation={0} classes={{ root: 'card' }}>
                      <img src="/assets/images/logo_text.svg" width="42%" />
                      <Card classes={{ root: 'card-body' }} variant="outlined">
                        <Typography classes={{ root: 'title' }}>
                          <EmoticonCryOutline color="primary" fontSize="large" classes={{ root: 'icon' }} />
                          {texts['NOT_READY']}
                        </Typography>
                        <CardContent>
                          <Typography gutterBottom={true}>{texts['NOT_READY_MESSAGE']}</Typography>
                        </CardContent>
                        <CardContent>
                          <Button
                            fullWidth={true}
                            variant="outlined"
                            onClick={() => history.push('/')}
                          >{texts['GO_BACK']}</Button>
                        </CardContent>
                      </Card>
                    </Card>
                  )
                }
                {
                  examState === 'resulted' && (
                    (exam && !_.isEmpty(examResult))
                      ? (
                        <Box className={classes.examPaperWrapper}>
                          <AppPaperContainer
                            paper={exam.paper}
                            mode="result"
                            result={examResult}
                          />
                        </Box>
                      )
                      : <AppIndicator type="empty" />
                  )
                }
                {
                  examState === 'reviewing' && (
                    exam
                      ? (
                        <Box className={classes.examPaperWrapper}>
                          <AppPaperContainer
                            paper={exam.paper}
                            mode="review"
                            result={examResult}
                            onQuestionScoreChange={(questionId, score) => {
                              const maximumPoints = examResult[questionId].points;
                              const scores = score > maximumPoints ? maximumPoints : score;
                              setExamResult({
                                ...examResult,
                                [questionId]: {
                                  ...examResult[questionId],
                                  scores,
                                },
                              });
                            }}
                            onPaperQuestionLoaded={(loadedPaperQuestions) => {
                              setPaperQuestionLoaded(true);
                              setPaperQuestions(loadedPaperQuestions);
                              setTimerUnlocked(true);
                            }}
                          />
                        </Box>
                      )
                      : <AppIndicator type="empty" />
                  )
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
                            {examEditorTexts['IS_PUBLIC']}:&nbsp;{exam.public ? systemTexts['TRUE'] : systemTexts['FALSE']}
                          </Typography>
                          {
                            exam.initiator && (
                              <Typography classes={{ root: clsx(classes.infoItem, classes.userItem) }} component="div">
                                {texts['INITIATOR']}: <AppUserCard user={exam.initiator} />
                              </Typography>
                            )
                          }
                          <Button
                            fullWidth={true}
                            disabled={!checkParticipantQualification(exam) || startExamLoading}
                            color="primary"
                            variant="contained"
                            classes={{ root: 'app-margin-top app-margin-bottom' }}
                            onClick={() => {
                              startParticipantExam(examId);
                              history.push(pushSearch(history, {
                                action: 'participate',
                              }));
                            }}
                          >{texts['START_EXAM']}</Button>
                          {
                            checkParticipantQualification(exam)
                              ? (
                                <Alert severity="info">
                                  <AlertTitle>{texts['NOTES']}</AlertTitle>
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: texts['NOTES_CONTENT'],
                                    }}
                                  ></div>
                                </Alert>
                              )
                              : (
                                <Alert severity="warning">
                                  <AlertTitle>{texts['CANNOT_START_EXAM']}</AlertTitle>
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: texts['CANNOT_START_EXAM_REASONS'],
                                    }}
                                  ></div>
                                </Alert>
                              )
                          }
                        </Card>
                      )
                      : <AppIndicator type="empty" />
                  )
                }
                {
                  examState === 'submitted' && (
                    <Card elevation={0} classes={{ root: 'card' }}>
                      <img src="/assets/images/logo_text.svg" width="42%" />
                      <Card classes={{ root: 'card-body' }} variant="outlined">
                        <Typography classes={{ root: 'title' }}>
                          <TextBoxCheckOutline color="primary" fontSize="large" classes={{ root: 'icon' }} />
                          {texts['EXAM_ANSWER_SUBMITTED']}
                        </Typography>
                        <CardContent>
                          <Typography gutterBottom={true}>{texts['SUBMITTED_MESSAGE']}</Typography>
                        </CardContent>
                        <CardContent>
                          <Button
                            fullWidth={true}
                            variant="outlined"
                            onClick={() => history.push('/')}
                          >{texts['GO_BACK']}</Button>
                        </CardContent>
                      </Card>
                    </Card>
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
