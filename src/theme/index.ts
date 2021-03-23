import { createMuiTheme } from '@material-ui/core';

export const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#2d4e76',
    },
    secondary: {
      main: '#ced4da',
    },
    warning: {
      main: '#bd6507',
    },
    info: {
      main: '#3d749a',
    },
  },
  typography: {
    fontSize: 13,
  },
});
