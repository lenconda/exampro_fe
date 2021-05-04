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
import Paper, { PaperProps } from '@material-ui/core/Paper';
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
      alignItems: 'center',
      padding: theme.spacing(2),
    },
    controlItem: {
      marginRight: theme.spacing(2),
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
  ...props
}) => {
  const classes = useStyles();
  const texts = useTexts(dispatch, 'paperContainer');
  const [paperQuestions, setPaperQuestions] = useState<PaperQuestionResponseData[]>([]);
  const [paperQuestionsLoading, setPaperQuestionsLoading] = useState<boolean>(true);
  const [paperAnswer, setPaperAnswer] = useState<ExamAnswerRequestData>({});
  const debouncedPaperAnswer = useDebouncedValue(paperAnswer);

  useEffect(() => {
    if (paper && paper.id) {
      setPaperQuestionsLoading(true);
      getPaperQuestions(paper.id).then((paperQuestions) => {
        setPaperQuestions(paperQuestions || []);
      }).finally(() => setPaperQuestionsLoading(false));
    }
  }, [paper]);

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
            ? (<AppIndicator type="loading" />)
            : paperQuestions.length === 0
              ? (<AppIndicator type="empty" />)
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
                          ...paperAnswer,
                          [question.id.toString()]: Array.from(pipeQuestionAnswerMetadataToRequest(question.type, answer)),
                        });
                      }}
                    />
                    {
                      mode !== 'answer' && (
                        <Paper elevation={0} classes={{ root: classes.controlWrapper }}>
                          {
                            mode === 'review' && (
                              <Typography
                                classes={{ root: classes.controlItem }}
                              >{texts['POINTS']}:&nbsp;{paperQuestion.points}</Typography>
                            )
                          }
                          {
                            ((mode === 'result' || mode === 'review') && result) && (
                              <Typography
                                classes={{ root: classes.controlItem }}
                              >{texts['SCORE']}:&nbsp;{result[paperQuestion.question.id].scores}</Typography>
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
