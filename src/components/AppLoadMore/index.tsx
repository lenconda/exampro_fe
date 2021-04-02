import { Dispatch } from '../../interfaces';
import { AppState } from '../../models/app';
import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import { useTexts } from '../../utils/texts';
import { makeStyles } from '@material-ui/core';
import Button, { ButtonProps } from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';
import _ from 'lodash';
import clsx from 'clsx';

export interface AppLoadMoreComponentProps extends ButtonProps {
  total?: number;
  currentCount?: number;
  loading?: boolean;
  pageSize?: number;
  onLoadMore?: () => void;
}

export interface AppLoadMoreProps extends AppLoadMoreComponentProps, AppState, Dispatch {}

const useStyles = makeStyles((theme) => {
  return {
    root: {},
  };
});

const AppLoadMore: React.FC<AppLoadMoreProps> = ({
  total = 0,
  currentCount = 0,
  loading = false,
  pageSize = 10,
  dispatch,
  onLoadMore,
  ...props
}) => {
  const systemTexts = useTexts(dispatch, 'system');
  const classes = useStyles();

  return (
    (total <= currentCount || pageSize > currentCount)
      ? null
      : (
        <Button
          disabled={loading}
          onClick={() => {
            if (_.isFunction(onLoadMore)) {
              onLoadMore();
            }
          }}
          fullWidth={true}
          variant="text"
          color="default"
          {...props}
          classes={{ root: clsx(classes.root, _.get(props, 'classes.root') || '') }}
        >
          {
            loading
              ? <CircularProgress size={18} />
              : systemTexts['LOAD_MORE']
          }
        </Button>
      )
  );
};

export default connect(({ app }: ConnectState) => app)(AppLoadMore) as React.FC<AppLoadMoreComponentProps>;
