import { connect } from '../../../../../patches/dva';
import { ConnectState } from '../../../../../models';
import { AppState } from '../../../../../models/app';
import { Dispatch, ExamStatus } from '../../../../../interfaces';
import { useTexts } from '../../../../../utils/texts';
import React from 'react';
import Chip, { ChipProps } from '@material-ui/core/Chip';
import _ from 'lodash';
import { makeStyles } from '@material-ui/core/styles';
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
      backgroundColor: theme.palette.warning.main,
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
        color="secondary"
        {...props}
        classes={{ root: clsx(rootClass, classes.finished) }}
      />;
    }
    case 'RESULTED': {
      return <Chip
        label={examStatusesTexts['RESULTED']}
        size="small"
        {...props}
        classes={{ root: clsx(rootClass) }}
      />;
    }
    default:
      return null;
    }
  };

  return generateChip(status);
};

export default connect(({ app }: ConnectState) => app)(StatusChip) as React.FC<StatusChipComponentProps>;
