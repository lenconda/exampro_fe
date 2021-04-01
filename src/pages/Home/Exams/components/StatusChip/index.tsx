import { connect } from '../../../../../patches/dva';
import { ConnectState } from '../../../../../models';
import { ExamStatus } from '../../service';
import { AppState } from '../../../../../models/app';
import { Dispatch } from '../../../../../interfaces';
import { useTexts } from '../../../../../utils/texts';
import React from 'react';
import Chip from '@material-ui/core/Chip';
import _ from 'lodash';
import { makeStyles } from '@material-ui/core';

interface StatusChipComponentProps {
  status: ExamStatus;
}

export interface StatusChipProps extends StatusChipComponentProps, AppState, Dispatch {}

const useStyles = makeStyles((theme) => {
  return {
    inProgress: {
      backgroundColor: theme.palette.success.main,
      color: theme.palette.primary.contrastText,
    },
  };
});

const StatusChip: React.FC<StatusChipProps> = ({
  status,
  dispatch,
}) => {
  const classes = useStyles();
  const examStatusesTexts = useTexts(dispatch, 'examStatuses');

  const generateChip = (status: ExamStatus) => {
    switch (status) {
    case 'PREPARING': {
      return <Chip
        label={examStatusesTexts['PREPARING']}
        color="primary"
        size="small"
      />;
    }
    case 'IN_PROGRESS': {
      return <Chip
        label={examStatusesTexts['IN_PROGRESS']}
        classes={{ root: classes.inProgress }}
        size="small"
      />;
    }
    case 'FINISHED': {
      return <Chip
        label={examStatusesTexts['FINISHED']}
        size="small"
      />;
    }
    default:
      return null;
    }
  };

  return generateChip(status);
};

export default connect(({ app }: ConnectState) => app)(StatusChip) as React.FC<StatusChipComponentProps>;
