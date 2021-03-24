import { Snackbar, SnackbarProps } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import AppAlert from '.';
import Manager from './Manager';

const Container: React.FC = (props) => {
  const [notifications, setNotifications] = useState<SnackbarProps[]>([]);

  useEffect(() => {
    const handler = (notifications) => {
      console.log(notifications);
      setNotifications(notifications);
    };
    Manager.addChangeListener(handler);
    return () => {
      Manager.removeChangeListener(handler);
    };
  }, []);

  return (
    <div>
      {
        notifications.map((notification, index) => (
          <AppAlert key={index} {...notification} />
        ))
      }
    </div>
  );
};

export default Container;
