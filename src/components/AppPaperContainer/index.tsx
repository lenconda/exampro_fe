import { getPaperQuestions } from './service';
import { AppState } from '../../models/app';
import { Dispatch, PaperResponseData, QuestionResponseData } from '../../interfaces';
import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import React, { useEffect, useState } from 'react';

export interface AppPaperContainerProps extends PaperProps {
  paper: PaperResponseData;
}
export interface AppPaperContainerComponentProps extends AppPaperContainerProps, AppState, Dispatch {}

const AppPaperContainer: React.FC<AppPaperContainerComponentProps> = ({
  paper,
  ...props
}) => {
  const [questions, setQuestions] = useState<QuestionResponseData[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (paper && paper.id) {
      getPaperQuestions(paper.id).then((questions) => {
        setQuestions(questions || []);
      });
    }
  }, [paper]);

  return (
    <Paper
      elevation={0}
      {...props}
    ></Paper>
  );
};

export default connect(({ app }: ConnectState) => app)(AppPaperContainer) as React.FC<AppPaperContainerProps>;
