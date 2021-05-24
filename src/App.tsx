import { connect } from './patches/dva';
import { ConnectState } from './models';
import { AppState } from './models/app';
import { theme } from './theme';
import Fallback from './components/Fallback';
import AppAlertContainer from './components/AppAlert/Container';
import AppRequestContainer from './components/AppRequest/Container';
import AppDialogContainer from './components/AppDialog/Container';
import { Dispatch as DispatchProps } from './interfaces';
import { getI18nTexts, getLanguageOptions } from './service';
import {
  Route,
  Redirect,
  BrowserRouter as Router,
  Switch,
} from 'react-router-dom';
import { StylesProvider, ThemeProvider } from '@material-ui/core/styles';
import React, { Suspense, useEffect } from 'react';
import { SnackbarProvider } from 'notistack';
import './App.less';
import _ from 'lodash';

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

export interface AppProps extends AppState, DispatchProps {}

const App: React.FC<AppProps> = ({
  dispatch,
  locale,
}) => {
  useEffect(() => {
    getI18nTexts().then((texts) => {
      dispatch({
        type: 'app/handleSetI18nTexts',
        payload: texts,
      });
    });
    getLanguageOptions().then((options) => {
      dispatch({
        type: 'app/setLanguageOptions',
        payload: options,
      });
    });
  }, [locale]);

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
