import React, { useEffect } from 'react';
import Manager from './Manager';
import { OptionsObject, useSnackbar } from 'notistack';

const Container: React.FC = (props) => {
  const snackbarQueue = useSnackbar();

  useEffect(() => {
    const handler = (options: OptionsObject & { message: string }) => {
      snackbarQueue.enqueueSnackbar(options.message, options);
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
