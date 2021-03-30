import React from 'react';
import { createStyles, IconButton, lighten, makeStyles, Theme, Toolbar, Tooltip, Typography } from '@material-ui/core';
import clsx from 'clsx';
import { Delete } from 'mdi-material-ui';
import { connect } from '../../../patches/dva';
import { ConnectState } from '../../../models';
import { Dispatch } from '../../../interfaces';
import { AppState } from '../../../models/app';
import { useTexts } from '../../../utils/texts';

export interface AppTableToolBarProps<T = any> extends Dispatch, AppState {
  selected?: T[];
}

const useToolbarStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
      theme.palette.type === 'light'
        ? {
          color: theme.palette.primary.main,
          backgroundColor: lighten(theme.palette.primary.light, 0.85),
        }
        : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.primary.dark,
        },
  title: {
    flex: '1 1 100%',
  },
}));

const AppTableToolbar: React.FC<AppTableToolBarProps> = ({
  selected = [],
  dispatch,
}) => {
  const classes = useToolbarStyles();
  const texts = useTexts(dispatch, 'table');

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: selected.length > 0,
      })}
    >
      <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
        {selected.length}&nbsp;{texts['006']}
      </Typography>
      <Tooltip title="Delete">
        <IconButton aria-label="delete">
          <Delete />
        </IconButton>
      </Tooltip>
    </Toolbar>
  );
};

export default connect(({ app }: ConnectState) => app)(AppTableToolbar);
