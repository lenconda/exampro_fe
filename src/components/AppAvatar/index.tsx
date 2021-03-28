import React, { useEffect, useRef, useState } from 'react';
import { User } from '../../interfaces';
import { Avatar, Button, makeStyles, Typography } from '@material-ui/core';
import './index.less';
import clsx from 'clsx';

export interface AvatarProps {
  children?: React.ReactNode;
  user?: User;
}

const useStyles = makeStyles((theme) => {
  return {
    wrapper: {
      padding: theme.spacing(1),
    },
    name: {
      marginRight: theme.spacing(1.2),
    },
  };
});

const AppAvatar: React.FC<AvatarProps> = (props) => {
  const ref = useRef(null);
  const classes = useStyles();
  const [name, setName] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('');
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.clientHeight);
    }
  }, [ref]);

  useEffect(() => {
    const { user } = props;
    if (!user) {
      return;
    }
    if (!user.avatar) {
      setAvatar('/assets/images/default_avatar.jpg');
    } else {
      setAvatar(user.avatar);
    }
    if (!user.name) {
      setName(user.email.split('@')[0]);
    } else {
      setName(user.name);
    }
  }, [props.user]);

  return (
    <Button
      ref={ref}
      classes={{
        root: clsx('app-avatar', classes.wrapper),
      }}
      style={{ borderRadius: height / 2 }}
    >
      {
        props.user && (
          <>
            <Typography classes={{ root: 'app-avatar__hi' }}>Hi,&nbsp;</Typography>
            <Typography
              noWrap={true}
              classes={{ root: clsx('app-avatar__name', classes.name) }}
            >{name}</Typography>
          </>
        )
      }
      <Avatar alt={name} src={avatar} classes={{ root: 'app-avatar__image' }} />
    </Button>
  );
};

export default AppAvatar;
