import { connect } from '../../../../../patches/dva';
import { ConnectState } from '../../../../../models';
import { AppState } from '../../../../../models/app';
import StatusChip from '../StatusChip';
import { Dispatch, Exam } from '../../../../../interfaces';
import { getExamStatus } from '../../service';
import React from 'react';
import Card, { CardProps } from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles, Typography } from '@material-ui/core';
import clsx from 'clsx';
import _ from 'lodash';

export interface ExamCardComponentProps extends CardProps {
  exam: Exam;
}

export interface ExamCardProps extends ExamCardComponentProps, AppState, Dispatch {}

const useStyles = makeStyles((theme) => {
  return {
    cardWrapper: {
      width: '100%',
      userSelect: 'none',
    },
    statusChip: {
      marginRight: 10,
    },
  };
});

const ExamCard: React.FC<ExamCardProps> = ({
  exam,
  dispatch,
  ...props
}) => {
  const {
    title = '',
  } = exam;
  const classes = useStyles();

  return (
    <Card
      {...props}
      classes={{
        root: clsx(classes.cardWrapper, _.get(props, 'classes.root') || ''),
      }}
    >
      <CardContent>
        <Tooltip title={title}>
          <Typography variant="subtitle1" align="left" noWrap={true}>
            <StatusChip
              status={getExamStatus(exam)}
              classes={{ root: classes.statusChip }}
            />
            {title}
          </Typography>
        </Tooltip>
      </CardContent>
    </Card>
  );
};

export default connect(({ app }: ConnectState) => app)(ExamCard) as React.FC<ExamCardComponentProps>;
