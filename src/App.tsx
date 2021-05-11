import { connect } from './patches/dva';
import { ConnectState } from './models';
import { AppState } from './models/app';
import { theme } from './theme';
import Fallback from './components/Fallback';
import AppAlertContainer from './components/AppAlert/Container';
import AppRequestContainer from './components/AppRequest/Container';
import AppDialogContainer from './components/AppDialog/Container';
import {
  Route,
  Redirect,
  BrowserRouter as Router,
  Switch,
} from 'react-router-dom';
import { StylesProvider, ThemeProvider } from '@material-ui/core';
import { Dispatch, AnyAction } from 'redux';
import React, { Suspense } from 'react';
import { SnackbarProvider } from 'notistack';
import './App.less';

// /home
const HomePage = React.lazy(() => import('./pages/Home'));
// /user/auth
const UserAuthPage = React.lazy(() => import('./pages/User/Auth'));
// /user/complete
const UserCompletePage = React.lazy(() => import('./pages/User/Complete'));
// /user/verify_email
const UserVerifyEmailPage = React.lazy(() => import('./pages/User/VerifyEmail'));
// /exam/:id
const ExamPage = React.lazy(() => import('./pages/Exam'));
// /403
const ForbiddenPage = React.lazy(() => import('./pages/403'));

export interface AppProps extends AppState {
  dispatch: Dispatch<AnyAction>;
}

const App: React.FC<AppProps> = (props) => {
  return (
    <ThemeProvider theme={theme}>
      <StylesProvider injectFirst={true}>
        <SnackbarProvider autoHideDuration={3000}>
          <Router>
            <AppAlertContainer />
            <AppRequestContainer />
            <AppDialogContainer />
            <Suspense fallback={<Fallback />}>
              <Switch>
                <Route path="/home" component={() => <HomePage />} />
                <Route path="/user/auth" component={() => <UserAuthPage />} />
                <Route path="/user/complete" component={() => <UserCompletePage />} />
                <Route path="/user/verify_email" component={() => <UserVerifyEmailPage />} />
                <Route path="/exam/:id" component={() => <ExamPage />} />
                <Route path="/403" component={() => <ForbiddenPage />} />
                <Redirect from="/" to="/home" exact={true} />
                <Redirect from="/exam" to="/" exact={true} />
              </Switch>
            </Suspense>
          </Router>
        </SnackbarProvider>
      </StylesProvider>
    </ThemeProvider>
  );
};

export default connect(({ app }: ConnectState) => app)(App);
