import { getPaperQuestions } from './service';
import { AppState } from '../../models/app';
import { Dispatch, PaperResponseData, QuestionResponseData } from '../../interfaces';
import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import AppIndicator from '../AppIndicator';
import AppQuestionItem from '../AppQuestionItem';
import { pipeQuestionResponseToMetadata } from '../../utils/pipes';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import _ from 'lodash';
import clsx from 'clsx';

export interface AppPaperContainerProps extends PaperProps {
  paper: PaperResponseData;
  mode?: 'answer' | 'review' | 'result';
}
export interface AppPaperContainerComponentProps extends AppPaperContainerProps, AppState, Dispatch {}

const useStyles = makeStyles((theme) => {
  return {
    wrapper: {
      padding: theme.spacing(16),
      paddingTop: theme.spacing(5),
      paddingBottom: theme.spacing(5),
    },
    questionItem: {
      marginBottom: theme.spacing(3),
    },
  };
});

const AppPaperContainer: React.FC<AppPaperContainerComponentProps> = ({
  paper,
  mode = 'answer',
  dispatch,
  ...props
}) => {
  const classes = useStyles();
  const [questions, setQuestions] = useState<QuestionResponseData[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (paper && paper.id) {
      setQuestionsLoading(true);
      getPaperQuestions(paper.id).then((questions) => {
        setQuestions(questions || []);
      }).finally(() => setQuestionsLoading(false));
    }
  }, [paper]);

  return (
    <Paper
      elevation={0}
      {...props}
      classes={_.merge(props.classes, {
        root: clsx(classes.wrapper, _.get(props, 'classes.root')),
      })}
    >
      {
        questionsLoading
          ? (<AppIndicator type="loading" />)
          : questions.length === 0
            ? (<AppIndicator type="empty" />)
            : questions.map((question, index) => {
              return (
                <Paper
                  key={question.id}
                  classes={{
                    root: classes.questionItem,
                  }}
                  elevation={0}
                >
                  <AppQuestionItem
                    answerable={mode === 'answer'}
                    questionNumber={index + 1}
                    question={pipeQuestionResponseToMetadata(question)}
                    showButtons={[]}
                    canCollapse={false}
                  />
                </Paper>
              );
            })
      }
    </Paper>
  );
};

export default connect(({ app }: ConnectState) => app)(AppPaperContainer) as React.FC<AppPaperContainerProps>;
