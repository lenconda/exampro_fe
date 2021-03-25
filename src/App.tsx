import React, { Suspense } from 'react';
import { connect } from './patches/dva';
import { ConnectState } from './models';
import { AppState } from './models/app';
import { Dispatch, AnyAction } from 'redux';
import { makeStyles, StylesProvider, ThemeProvider } from '@material-ui/core';
import {
  Route,
  Redirect,
  BrowserRouter as Router,
  Switch,
} from 'react-router-dom';
import { theme } from './theme';
import Fallback from './components/Fallback';
import AppAlertContainer from './components/AppAlert/Container';
import AppRequestContainer from './components/AppRequest/Container';
import { SnackbarProvider } from 'notistack';
import './App.less';

// /home
const HomePage = React.lazy(() => import('./pages/Home'));
// /user/auth
const UserAuthPage = React.lazy(() => import('./pages/User/Auth'));

export interface AppProps extends AppState {
  dispatch: Dispatch<AnyAction>;
}

const useStyles = makeStyles((theme) => {
  return {
    sideBar: {
      width: 360,
    },
  };
});

const App: React.FC<AppProps> = (props) => {
  return (
    <ThemeProvider theme={theme}>
      <StylesProvider injectFirst={true}>
        <SnackbarProvider autoHideDuration={3000}>
          <Router>
            <AppAlertContainer />
            <AppRequestContainer />
            <Suspense fallback={<Fallback />}>
              <Switch>
                <Route path="/home" component={() => <HomePage />} />
                <Route path="/user/auth" component={() => <UserAuthPage />} />
                <Redirect from="/" to="/home" exact={true} />
              </Switch>
            </Suspense>
          </Router>
        </SnackbarProvider>
      </StylesProvider>
    </ThemeProvider>
  );
};

export default connect(({ app }: ConnectState) => app)(App);
