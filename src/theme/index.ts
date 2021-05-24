import { createMuiTheme } from '@material-ui/core/styles';

export const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#2d4e76',
    },
    secondary: {
      main: '#2979ff',
    },
    warning: {
      main: '#bd6507',
    },
    info: {
      main: '#3d749a',
    },
    text: {
      primary: '#202124',
    },
  },
  typography: {
    fontSize: 13,
  },
  props: {
    MuiListItem: {
      color: 'red',
    },
  },
});
