import React, { useEffect, useState } from 'react';
import { Snackbar, SnackbarContent, SnackbarProps } from '@material-ui/core';

const AppAlert: React.FC<SnackbarProps> = (props) => {
  const [open, setOpen] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      setOpen(false);
    }, 3000);
  }, []);

  return (
    <Snackbar {...props} open={open} key={Math.random().toString(32)} />
  );
};

export default AppAlert;
