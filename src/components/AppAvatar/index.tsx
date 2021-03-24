import React, { useEffect, useRef, useState } from 'react';
import { User } from '../../interfaces';
import { Avatar, Button, Typography } from '@material-ui/core';
import './index.less';

export interface AvatarProps {
  children?: React.ReactNode;
  user?: User;
}

const AppAvatar: React.FC<AvatarProps> = (props) => {
  const [name, setName] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('');
  const [height, setHeight] = useState<number>(0);
  const ref = useRef(null);

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
      console.log(111);
      setName(user.email.split('@')[0]);
    } else {
      setName(user.name);
    }
  }, [props.user]);

  return (
    <Button
      ref={ref}
      className="app-avatar"
      style={{ borderRadius: height / 2 }}
    >
      {
        props.user && (
          <>
            <Typography classes={{ root: 'app-avatar__hi' }}>Hi,&nbsp;</Typography>
            <Typography noWrap={true} classes={{ root: 'app-avatar__name' }}>{name}</Typography>
          </>
        )
      }
      <Avatar alt={name} src={avatar} classes={{ root: 'app-avatar__image' }} />
    </Button>
  );
};

export default AppAvatar;
