import { User } from '../../interfaces';
import Avatar from '@material-ui/core/Avatar';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import './index.less';

export interface AppUserCardProps extends PaperProps {
  user?: User;
}

const useStyles = makeStyles((theme) => ({
  userCard: {
    paddingTop: theme.spacing(1.2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(1.2),
    paddingLeft: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
  avatarWrapper: {
    marginRight: theme.spacing(0.8),
  },
  infoWrapper: {
    marginLeft: theme.spacing(0.8),
  },
}));

const AppUserCard: React.FC<AppUserCardProps> = React.forwardRef(({
  user,
  ...props
}, ref) => {
  const classes = useStyles();
  const [name, setName] = useState<string>('');

  const {
    email,
    description,
    avatar,
  } = user;

  useEffect(() => {
    const { name } = user;
    setName(name || email.split('@')[0]);
  }, [user]);

  return (
    user && (
      <Paper
        {...props}
        elevation={0}
        classes={{
          root: clsx(
            classes.userCard,
            `app-user-card ${_.get(props, 'classes.root') || ''}`,
          ),
        }}
      >
        <div className="app-user-card__avatar-wrapper">
          <Avatar src={avatar} />
        </div>
        <div className={clsx('app-user-card__info-wrapper', classes.infoWrapper)}>
          <Typography
            noWrap={true}
            classes={{ root: 'name' }}
          >{name || email}</Typography>
          <Typography variant="subtitle2" classes={{ root: 'email' }}>{email}</Typography>
          {
            description && (
              <Typography
                variant="body1"
                classes={{ root: 'description' }}
              >{description}</Typography>
            )
          }
        </div>
      </Paper>
    )
  );
});

export default AppUserCard;
