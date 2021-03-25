import { SnackbarProps } from '@material-ui/core';
import React, { useEffect } from 'react';
import Manager from './Manager';
import { useSnackbar } from 'notistack';

const Container: React.FC = (props) => {
  const snackbarQueue = useSnackbar();

  useEffect(() => {
    const handler = (prop: SnackbarProps) => {
      snackbarQueue.enqueueSnackbar(prop.message);
    };
    Manager.addChangeListener(handler);
    return () => {
      Manager.removeChangeListener(handler);
    };
  }, []);

  return (
    <></>
  );
};

export default Container;
