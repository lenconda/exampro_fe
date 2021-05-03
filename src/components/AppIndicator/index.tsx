import { ConnectState } from '../../models';
import { connect } from '../../patches/dva';
import { Dispatch } from '../../interfaces';
import { AppState } from '../../models/app';
import { useTexts } from '../../utils/texts';
import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import FileQuestionIcon from 'mdi-material-ui/FileQuestion';

export type AppIndicatorType = 'loading' | 'empty';
export interface AppIndicatorProps {
  type: AppIndicatorType;
}
export interface AppIndicatorComponentProps extends AppIndicatorProps, Dispatch, AppState {}

const AppIndicator: React.FC<AppIndicatorComponentProps> = ({
  dispatch,
  type,
}) => {
  const systemTexts = useTexts(dispatch, 'system');

  if (type === 'empty') {
    return (
      <div className="app-empty">
        <FileQuestionIcon classes={{ root: 'app-empty__icon' }} />
        <Typography classes={{ root: 'app-empty__text' }}>{systemTexts['EMPTY']}</Typography>
      </div>
    );
  } else if (type === 'loading') {
    return (
      <div className="app-loading">
        <CircularProgress classes={{ root: 'app-loading__icon' }} />
      </div>
    );
  } else { return <></> }
};

export default connect(({ app }: ConnectState) => app)(AppIndicator) as React.FC<AppIndicatorProps>;
