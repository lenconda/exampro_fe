import { Avatar, Paper, PaperProps, Typography } from '@material-ui/core';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { User } from '../../interfaces';
import './index.less';

export interface AppUserCardProps extends PaperProps {
  user?: User;
}

const AppUserCard: React.FC<AppUserCardProps> = React.forwardRef(({
  user,
  ...props
}, ref) => {
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
          root: `app-user-card ${_.get(props, 'classes.root') || ''}`,
        }}
      >
        <div className="app-user-card__avatar-wrapper">
          <Avatar src={avatar} />
        </div>
        <div className="app-user-card__info-wrapper">
          <Typography
            noWrap={true}
            variant="h6"
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
