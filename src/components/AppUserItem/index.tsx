import { User } from '../../interfaces';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import _ from 'lodash';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core';

export interface AppUserItemProps extends PaperProps {
  user?: User;
  selected?: boolean;
  onSelect?(): void;
  onCancelSelect?(): void;
}

const useStyles = makeStyles((theme) => {
  return {
    wrapper: {
      display: 'flex',
      padding: theme.spacing(2),
      alignItems: 'center',
    },
    avatar: {
      height: '100%',
      flexGrow: 0,
      flexShrink: 0,
      marginLeft: theme.spacing(1),
    },
    infoWrapper: {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      flexShrink: 1,
      marginLeft: theme.spacing(2),
      overflow: 'hidden',
    },
  };
});

const AppUserItem: React.FC<AppUserItemProps> = ({
  user,
  selected = false,
  onSelect,
  onCancelSelect,
  ...props
}) => {
  const classes = useStyles();

  return (
    <Paper
      {...props}
      classes={_.merge(_.get(props, 'classes'), {
        root: clsx(_.get(props, 'classes.root'), classes.wrapper),
      })}
    >
      <Checkbox
        color="primary"
        checked={selected}
        onChange={(event) => {
          const checked = event.target.checked;
          if (checked) {
            if (_.isFunction(onSelect)) {
              onSelect();
            }
          } else {
            if (_.isFunction(onCancelSelect)) {
              onCancelSelect();
            }
          }
        }}
      />
      <Avatar
        classes={{ root: classes.avatar }}
        src={user.avatar || '/assets/images/default_avatar.jpg'}
      />
      <Box className={classes.infoWrapper}>
        <Typography
          variant="subtitle1"
          noWrap={true}
        >{user.name || user.email.split('@')[0]}</Typography>
        <Typography
          variant="subtitle2"
          noWrap={true}
        >{user.email}</Typography>
      </Box>
    </Paper>
  );
};

export default AppUserItem;
