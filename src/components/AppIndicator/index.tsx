import { ConnectState } from '../../models';
import { connect } from '../../patches/dva';
import { Dispatch } from '../../interfaces';
import { AppState } from '../../models/app';
import { useTexts } from '../../utils/texts';
import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import FileQuestionIcon from 'mdi-material-ui/FileQuestion';
import SentimentDissatisfiedIcon from '@material-ui/icons/SentimentDissatisfied';

export type AppIndicatorType = 'loading' | 'empty' | 'not_ready' | 'forbidden';
export interface AppIndicatorProps {
  type: AppIndicatorType;
}
export interface AppIndicatorComponentProps extends AppIndicatorProps, Dispatch, AppState {}

const AppIndicator: React.FC<AppIndicatorComponentProps> = ({
  dispatch,
  type,
}) => {
  const systemTexts = useTexts(dispatch, 'system');

  switch (type) {
  case 'empty': {
    return (
      <div className="app-empty">
        <FileQuestionIcon classes={{ root: 'app-empty__icon' }} />
        <Typography classes={{ root: 'app-empty__text' }}>{systemTexts['EMPTY']}</Typography>
      </div>
    );
  }
  case 'loading': {
    return (
      <div className="app-loading">
        <CircularProgress classes={{ root: 'app-loading__icon' }} />
      </div>
    );
  }
  case 'not_ready': {
    return (
      <div className="app-not_ready">
        <SentimentDissatisfiedIcon classes={{ root: 'app-not_ready__icon' }} />
        <Typography classes={{ root: 'app-not_ready__text' }}>{systemTexts['NOT_READY']}</Typography>
      </div>
    );
  }
  case 'forbidden': {
    return (
      <div className="app-not_ready">
        <SentimentDissatisfiedIcon classes={{ root: 'app-not_ready__icon' }} />
        <Typography classes={{ root: 'app-not_ready__text' }}>{systemTexts['FORBIDDEN']}</Typography>
      </div>
    );
  }
  default:
    return null;
  }
};

export default connect(({ app }: ConnectState) => app)(AppIndicator) as React.FC<AppIndicatorProps>;
