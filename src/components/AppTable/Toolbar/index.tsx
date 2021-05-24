import { connect } from '../../../patches/dva';
import { ConnectState } from '../../../models';
import { Dispatch } from '../../../interfaces';
import { AppState } from '../../../models/app';
import { useTexts } from '../../../utils/texts';
import clsx from 'clsx';
import IconButton, { IconButtonProps } from '@material-ui/core/IconButton';
import Toolbar, { ToolbarProps } from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';
import { SvgIconTypeMap } from '@material-ui/core/SvgIcon';
import { createStyles, lighten, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import _ from 'lodash';

export interface ToolbarButton {
  title: string;
  show?: boolean;
  Icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
  IconButtonProps?: IconButtonProps;
}

export interface AppTableToolBarProps<T = any> extends ToolbarProps {
  selected?: T[];
  buttons?: ToolbarButton[];
}

export interface AppTableToolBarComponentProps<T = any> extends AppTableToolBarProps<T>, Dispatch, AppState {}

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

const AppTableToolbar: React.FC<AppTableToolBarComponentProps> = ({
  selected = [],
  buttons = [],
  dispatch,
  ...props
}) => {
  const classes = useToolbarStyles();
  const tableTexts = useTexts(dispatch, 'table');

  return (
    <Toolbar
      {...props}
      className={clsx(classes.root, {
        [classes.highlight]: selected.length > 0,
      })}
    >
      <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
        {selected.length}&nbsp;{tableTexts['006']}
      </Typography>
      {
        buttons.map((buttonConfig, index) => {
          const { Icon, IconButtonProps, title, show = true } = buttonConfig;
          return (
            show && (
              <Tooltip title={title} key={index}>
                <IconButton aria-label={title} {...IconButtonProps}>
                  <Icon />
                </IconButton>
              </Tooltip>
            )
          );
        })
      }
    </Toolbar>
  );
};

export default connect(({ app }: ConnectState) => app)(AppTableToolbar) as React.FC<AppTableToolBarProps>;
