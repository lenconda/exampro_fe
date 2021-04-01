import { connect } from '../../../../../patches/dva';
import { ConnectState } from '../../../../../models';
import { ExamStatus } from '../../service';
import { AppState } from '../../../../../models/app';
import { Dispatch } from '../../../../../interfaces';
import { useTexts } from '../../../../../utils/texts';
import React from 'react';
import Chip, { ChipProps } from '@material-ui/core/Chip';
import _ from 'lodash';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';

interface StatusChipComponentProps extends ChipProps {
  status: ExamStatus;
}

export interface StatusChipProps extends StatusChipComponentProps, AppState, Dispatch {}

const useStyles = makeStyles((theme) => {
  return {
    inProgress: {
      backgroundColor: theme.palette.success.main,
      color: theme.palette.primary.contrastText,
    },
    finished: {
      color: theme.palette.primary.main,
    },
  };
});

const StatusChip: React.FC<StatusChipProps> = ({
  status,
  dispatch,
  ...props
}) => {
  const classes = useStyles();
  const examStatusesTexts = useTexts(dispatch, 'examStatuses');
  const rootClass = _.get(props, 'classes.root') || '';

  const generateChip = (status: ExamStatus) => {
    switch (status) {
    case 'PREPARING': {
      return <Chip
        label={examStatusesTexts['PREPARING']}
        color="primary"
        size="small"
        {...props}
        classes={{ root: clsx(rootClass) }}
      />;
    }
    case 'IN_PROGRESS': {
      return <Chip
        label={examStatusesTexts['IN_PROGRESS']}
        size="small"
        {...props}
        classes={{ root: clsx(classes.inProgress, rootClass) }}
      />;
    }
    case 'FINISHED': {
      return <Chip
        label={examStatusesTexts['FINISHED']}
        size="small"
        {...props}
        classes={{ root: clsx(rootClass, classes.finished) }}
      />;
    }
    default:
      return null;
    }
  };

  return generateChip(status);
};

export default connect(({ app }: ConnectState) => app)(StatusChip) as React.FC<StatusChipComponentProps>;
