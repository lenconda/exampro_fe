import React from 'react';
import { createStyles, IconButton, lighten, makeStyles, Theme, Toolbar, Tooltip, Typography } from '@material-ui/core';
import clsx from 'clsx';
import { Delete } from 'mdi-material-ui';
import { FilterList } from '@material-ui/icons';

export interface AppTableToolBarProps<T = any> {
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
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
        : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  title: {
    flex: '1 1 100%',
  },
}));

const AppTableToolbar: React.FC<AppTableToolBarProps> = ({
  selected = [],
}) => {
  const classes = useToolbarStyles();

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: selected.length > 0,
      })}
    >
      {selected.length > 0 ? (
        <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
          {selected} selected
        </Typography>
      ) : (
        <Typography className={classes.title} variant="h6" component="div">
          Nutrition
        </Typography>
      )}
      {selected.length > 0 ? (
        <Tooltip title="Delete">
          <IconButton aria-label="delete">
            <Delete />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton aria-label="filter list">
            <FilterList />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
};

export default AppTableToolbar;
