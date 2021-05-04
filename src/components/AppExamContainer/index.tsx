import { AppState } from '../../models/app';
import {
  Dispatch,
  ExamAnswerRequestData,
  ExamResponseData,
  ExamResultResponseData,
  PaperQuestionResponseData,
  PaperResponseData,
} from '../../interfaces';
import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import AppIndicator from '../AppIndicator';
import { useTexts } from '../../utils/texts';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import _ from 'lodash';
import clsx from 'clsx';

export interface AppExamContainerProps extends PaperProps {
  exam: ExamResponseData;
}
export interface AppExamContainerComponentProps extends AppExamContainerProps, AppState, Dispatch {}
export type ExamState = 'waiting_for_confirmation' | 'processing' | 'resulted';

const useStyles = makeStyles((theme) => {
  return {
    wrapper: {
      padding: theme.spacing(2),
      display: 'flex',
      justifyContent: 'center',
    },
  };
});

const AppPaperContainer: React.FC<AppExamContainerComponentProps> = ({
  exam,
  dispatch,
  ...props
}) => {
  const classes = useStyles();
  const texts = useTexts(dispatch, 'examContainer');
  const [examLoading, setExamLoading] = useState<boolean>(false);
  const [examState, setExamState] = useState<ExamState>('waiting_for_confirmation');
  const [participantAnswer, setParticipantAnswer] = useState<ExamAnswerRequestData>({});

  return (
    <Paper
      elevation={0}
      {...props}
      classes={_.merge(props.classes, {
        root: clsx(classes.wrapper, _.get(props, 'classes.root')),
      })}
    >
      {/* <AppPaperContainer /> */}
    </Paper>
  );
};

export default connect(({ app }: ConnectState) => app)(AppPaperContainer) as React.FC<AppExamContainerProps>;
