import { User } from '../../interfaces';
import React, { useEffect, useRef, useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import './index.less';
import clsx from 'clsx';

export interface AvatarProps {
  children?: React.ReactNode;
  user?: User;
  loading?: boolean;
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

const AppAvatar: React.FC<AvatarProps> = ({
  user,
  loading = false,
}) => {
  const ref = useRef<HTMLButtonElement>(null);
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
  }, [user]);

  const generateComponent = () => {
    if (loading) {
      return (
        <div className="app-avatar loading">
          <CircularProgress color="primary" size={22} classes={{ root: 'app-avatar__icon' }} />
        </div>
      );
    }
    return (
      <Button
        ref={ref}
        classes={{
          root: clsx('app-avatar', classes.wrapper),
        }}
        style={{ borderRadius: height / 2 }}
      >
        {
          user && (
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

  return generateComponent();
};

export default AppAvatar;
