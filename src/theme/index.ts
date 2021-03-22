import { createMuiTheme } from '@material-ui/core';

export const theme = createMuiTheme({
  props: {
    MuiButtonBase: {
      disableRipple: true,
    },
    MuiButtonGroup: {
      disableFocusRipple: true,
      disableRipple: true,
    },
  },
  palette: {
    primary: {
      main: '#2d4e76',
    },
  },
  typography: {
    fontSize: 13,
  },
});
