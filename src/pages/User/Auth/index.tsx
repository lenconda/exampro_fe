import { forgetPassword, getEmailAuthType, login } from './service';
import { ConnectState } from '../../../models';
import { AppState } from '../../../models/app';
import { usePageTexts } from '../../../utils/texts';
import { Dispatch } from '../../../interfaces';
import { decodeRedirectPathnameToString } from '../../../utils/redirect';
import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import Checkbox from '@material-ui/core/Checkbox';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import { Field, Form as FormikForm, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import DatabaseCheckIcon from 'mdi-material-ui/DatabaseCheck';
import FingerprintIcon from 'mdi-material-ui/Fingerprint';
import HeadCheckIcon from 'mdi-material-ui/HeadCheck';
import { connect } from 'react-redux';
import { useHistory } from 'react-router';
import _ from 'lodash';
import qs from 'qs';
import './index.less';

const Form = FormikForm as any;

export interface AuthPageProps extends AppState, Dispatch {}

const AuthPage: React.FC<AuthPageProps> = (props) => {
  const [authStatus, setAuthStatus] = useState<'login' | 'register' | 'forget_password'>(null);
  const [isForgetPasswordPending, setIsForgetPasswordPending] = useState<boolean>(false);
  const history = useHistory();
  const texts = usePageTexts(props.dispatch, '/user/auth');

  return (
    <div className="app-page app-page-auth">
      <img src="/assets/images/logo_text.svg" className="app-page-auth__logo" />
      <Card classes={{ root: 'app-page-auth__card' }} elevation={0}>
        <div className="app-page-auth__card__icons">
          <CssBaseline />
          {
            (!authStatus || authStatus === 'login') && (
              <FingerprintIcon fontSize="large" className="icon" />
            )
          }
          {
            authStatus === 'register' && (
              <DatabaseCheckIcon fontSize="large" className="icon success" />
            )
          }
          {
            authStatus === 'forget_password' && (
              <HeadCheckIcon fontSize="large" className="icon success" />
            )
          }
          <Typography className="title">
            {
              (!authStatus || authStatus === 'login') && texts['001']
            }
            {
              authStatus === 'register' && texts['011']
            }
            {
              authStatus === 'forget_password' && texts['012']
            }
          </Typography>
        </div>
        {
          (!authStatus || authStatus === 'login')
            ? (
              <Formik
                initialValues={{
                  email: '',
                  password: '',
                }}
                validate={(values) => {
                  const errors = {} as Record<string, any>;
                  if (!values.email) {
                    errors.email = texts['009'];
                  } else if (
                    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)
                  ) {
                    errors.email = texts['008'];
                  }
                  return errors;
                }}
                onSubmit={(values, { setSubmitting }) => {
                  const { email, password } = values;
                  if (!authStatus && !isForgetPasswordPending) {
                    getEmailAuthType(email)
                      .then((type) => {
                        setAuthStatus(type);
                      })
                      .catch(() => {})
                      .finally(() => setSubmitting(false));
                  } else if (isForgetPasswordPending) {
                    forgetPassword(values.email)
                      .then((res) => {
                        if (res) {
                          setAuthStatus('forget_password');
                        }
                      })
                      .finally(() => setSubmitting(false));
                  }
                  if (authStatus === 'login' && !isForgetPasswordPending) {
                    login(email, password)
                      .then((res) => {
                        if (res) {
                          const search = (_.get(history, 'location.search') || '').slice(1);
                          const { redirect } = qs.parse(search);
                          if (redirect && typeof redirect === 'string') {
                            history.push(decodeRedirectPathnameToString(redirect));
                          } else {
                            history.push('/');
                          }
                        }
                      })
                      .catch(() => {})
                      .finally(() => setSubmitting(false));
                  }
                }}
              >
                {({ submitForm, isSubmitting }) => (
                  <Form
                    className="app-form app-page-auth__card__form"
                    onKeyDown={(e) => {
                      if (e && e.key && e.key === 'Enter' && ['login', 'register'].indexOf(authStatus) !== -1) {
                        console.log(authStatus);
                        submitForm();
                      }
                    }}
                  >
                    <Field
                      component={TextField}
                      name="email"
                      type="email"
                      label={texts['002']}
                      variant="outlined"
                      className="input-wrapper"
                      InputProps={{
                        className: 'input',
                        disabled: authStatus === 'login',
                      }}
                    />
                    {
                      authStatus === 'login' && (
                        <>
                          <Field
                            component={TextField}
                            type="password"
                            label={texts['003']}
                            name="password"
                            variant="outlined"
                            className="input-wrapper"
                            InputProps={{
                              className: 'input',
                            }}
                          />
                          <FormControlLabel
                            classes={{ root: 'checkbox-wrapper' }}
                            label={texts['006']}
                            control={
                              <Checkbox
                                color="primary"
                                defaultChecked={JSON.parse(localStorage.getItem('persist') || 'false')}
                                onChange={(event) => {
                                  localStorage.setItem('persist', JSON.stringify(event.target.checked));
                                }}
                              />
                            }
                          />
                        </>
                      )
                    }
                    <Button
                      variant="contained"
                      color="primary"
                      className="button-wrapper"
                      disabled={isSubmitting}
                      onClick={submitForm}
                    >{authStatus === 'login' ? texts['010'] : texts['004']}</Button>
                    {
                      authStatus === 'login' && (
                        <Button
                          color="secondary"
                          className="button-wrapper"
                          disabled={isSubmitting}
                          onClick={() => {
                            setIsForgetPasswordPending(true);
                            submitForm();
                          }}
                        >{texts['005']}</Button>
                      )
                    }
                    {isSubmitting && <LinearProgress />}
                  </Form>
                )}
              </Formik>
            )
            : <>
              <Typography variant="subtitle1" style={{ textAlign: 'center' }}>{texts['013']}</Typography>
            </>
        }
      </Card>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(AuthPage);
