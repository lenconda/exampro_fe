import { getPaperQuestions } from './service';
import { AppState } from '../../models/app';
import {
  Dispatch,
  ExamAnswerRequestData,
  ExamResultResponseData,
  PaperQuestionResponseData,
  PaperResponseData,
} from '../../interfaces';
import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import AppIndicator from '../AppIndicator';
import AppQuestionItem from '../AppQuestionItem';
import {
  pipeQuestionAnswerMetadataToRequest,
  pipeQuestionAnswerRequestToMetadata,
  pipeQuestionResponseToMetadata,
} from '../../utils/pipes';
import { useTexts } from '../../utils/texts';
import { useDebouncedValue } from '../../utils/hooks';
import { generateDefaultQuestionAnswer } from '../../utils/question';
import { getPaperQuestionsWithAnswers } from '../AppPaperEditor/service';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import _ from 'lodash';
import clsx from 'clsx';

export interface AppPaperContainerProps extends PaperProps {
  paper: PaperResponseData;
  mode?: 'answer' | 'review' | 'result';
  result?: ExamResultResponseData;
  maxWidth?: number;
  onAnswerChange?(paper: PaperResponseData, answer: ExamAnswerRequestData): void;
  onPaperQuestionLoaded?(paperQuestions: PaperQuestionResponseData[]): void;
  onPaperQuestionLoading?(): void;
  onQuestionScoreChange?(questionId: number, score: number): void;
}
export interface AppPaperContainerComponentProps extends AppPaperContainerProps, AppState, Dispatch {}

const useStyles = makeStyles((theme) => {
  return {
    paperContainerWrapper: {
      padding: theme.spacing(5),
      display: 'flex',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    questionsWrapper: {
    },
    questionItem: {
      marginBottom: theme.spacing(6),
    },
    controlWrapper: {
      display: 'flex',
      flexDirection: 'column',
      padding: theme.spacing(2),
    },
    controlItem: {
      marginRight: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  };
});

const AppPaperContainer: React.FC<AppPaperContainerComponentProps> = ({
  paper,
  mode = 'answer',
  result,
  maxWidth = 600,
  dispatch,
  onAnswerChange,
  onPaperQuestionLoaded,
  onPaperQuestionLoading,
  onQuestionScoreChange,
  ...props
}) => {
  const classes = useStyles();
  const texts = useTexts(dispatch, 'paperContainer');
  const [paperQuestions, setPaperQuestions] = useState<PaperQuestionResponseData[]>([]);
  const [paperQuestionsLoading, setPaperQuestionsLoading] = useState<boolean>(true);
  const [paperAnswer, setPaperAnswer] = useState<ExamAnswerRequestData>({});
  const debouncedPaperAnswer = useDebouncedValue(paperAnswer);

  const fetchPaperQuestions = async (mode) => {
    let request;
    if (mode === 'answer') {
      request = getPaperQuestions(paper.id);
    } else {
      request = getPaperQuestionsWithAnswers(paper.id);
    }
    if (request && request instanceof Promise) {
      setPaperQuestionsLoading(true);
      request.then((paperQuestions) => {
        const currentPaperQuestions = paperQuestions || [];
        setPaperQuestions(currentPaperQuestions);
        if (_.isFunction(onPaperQuestionLoaded)) {
          onPaperQuestionLoaded(currentPaperQuestions);
        }
      }).finally(() => setPaperQuestionsLoading(false));
    }
  };

  useEffect(() => {
    if (paper && paper.id) {
      setPaperQuestionsLoading(true);
      if (_.isFunction(onPaperQuestionLoading)) {
        onPaperQuestionLoading();
      }
      fetchPaperQuestions(mode);
    }
  }, [paper]);

  useEffect(() => {
    if (paperQuestions.length > 0) {
      setPaperAnswer(paperQuestions.reduce((result, currentPaperQuestion) => {
        const question = currentPaperQuestion.question;
        const { id, type } = question;
        result[id.toString()] = pipeQuestionAnswerMetadataToRequest(type, generateDefaultQuestionAnswer(question));
        return result;
      }, {}));
    }
  }, [paperQuestions]);

  useEffect(() => {
    if (_.isFunction(onAnswerChange)) {
      onAnswerChange(paper, debouncedPaperAnswer);
    }
  }, [debouncedPaperAnswer]);

  return (
    <Paper
      elevation={0}
      {...props}
      classes={_.merge(props.classes, {
        root: clsx(classes.paperContainerWrapper, _.get(props, 'classes.root')),
      })}
    >
      <Paper
        elevation={0}
        style={{
          maxWidth,
          backgroundColor: 'transparent',
        }}
      >
        {
          paperQuestionsLoading
            ? <AppIndicator type="loading" />
            : paperQuestions.length === 0
              ? <AppIndicator type="empty" />
              : paperQuestions.map((paperQuestion, index) => {
                return (
                  <Paper
                    key={paperQuestion.id}
                    classes={{
                      root: classes.questionItem,
                    }}
                    variant="outlined"
                    elevation={0}
                  >
                    <AppQuestionItem
                      answerable={mode === 'answer'}
                      questionNumber={index + 1}
                      elevation={0}
                      question={pipeQuestionResponseToMetadata(paperQuestion.question)}
                      participantAnswer={
                        mode !== 'answer'
                          ? pipeQuestionAnswerRequestToMetadata(
                            _.get(paperQuestion, 'question.type'),
                            _.get(_.get(result, _.get(paperQuestion, 'question.id')), 'answer') || [],
                          )
                          : null
                      }
                      showButtons={[]}
                      canCollapse={false}
                      onAnswerChange={(question, answer) => {
                        setPaperAnswer({
                          ..._.set(
                            _.clone(paperAnswer),
                            question.id.toString(),
                            Array.from(pipeQuestionAnswerMetadataToRequest(question.type, answer)),
                          ),
                        });
                      }}
                    />
                    {
                      mode !== 'answer' && (
                        <Paper elevation={0} classes={{ root: classes.controlWrapper }}>
                          {
                            (mode === 'review' || mode === 'result') && (
                              <Typography
                                classes={{ root: classes.controlItem }}
                              >{texts['POINTS']}:&nbsp;{paperQuestion.points}</Typography>
                            )
                          }
                          {
                            (mode === 'result' && result) && (
                              <Typography
                                classes={{ root: classes.controlItem }}
                              >{texts['SCORE']}:&nbsp;{result[paperQuestion.question.id].scores}</Typography>
                            )
                          }
                          {
                            (mode === 'review' && result) && (
                              <TextField
                                type="number"
                                label={texts['INPUT_SCORE']}
                                value={_.get(result[paperQuestion.question.id], 'scores')}
                                onChange={(event) => {
                                  if (_.isFunction(onQuestionScoreChange)) {
                                    onQuestionScoreChange(paperQuestion.question.id, parseInt(event.target.value, 10));
                                  }
                                }}
                              />
                            )
                          }
                        </Paper>
                      )
                    }
                  </Paper>
                );
              })
        }
      </Paper>
    </Paper>
  );
};

export default connect(({ app }: ConnectState) => app)(AppPaperContainer) as React.FC<AppPaperContainerProps>;
