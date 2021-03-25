import React, { useState } from 'react';
import { Button, Card, CssBaseline, LinearProgress, Typography } from '@material-ui/core';
import { Field, Form as FormikForm, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import { ProgressCheck, ProgressClock } from 'mdi-material-ui';
import { connect } from 'react-redux';
import { ConnectState } from '../../../models';
import { AppState } from '../../../models/app';
import { useHistory } from 'react-router-dom';
import _ from 'lodash';
import { getQuery } from '../../../utils/qs';
import AppAlertManager from '../../../components/AppAlert/Manager';
import './index.less';
import { completeResetPassword, completeRegistration } from './service';

const Form = FormikForm as any;

export interface CompletePageProps extends AppState {}

const CompletePage: React.FC<CompletePageProps> = (props) => {
  const [authStatus, setAuthStatus] = useState<'pending' | 'finished'>(null);
  const texts = props.i18n[props.locale].ui['/user/complete'] || {};
  const history = useHistory();
  const type = getQuery(history.location.search, 'type');

  return (
    <div className="app-page app-page-complete">
      <img src="/assets/images/logo_text.svg" className="app-page-complete__logo" />
      <Card classes={{ root: 'app-page-complete__card' }} elevation={0}>
        <div className="app-page-complete__card__icons">
          <CssBaseline />
          {
            (!authStatus || authStatus === 'pending') && (
              <ProgressClock fontSize="large" className="icon" />
            )
          }
          {
            (authStatus === 'finished') && (
              <ProgressCheck fontSize="large" className="icon" />
            )
          }
          {
            (!authStatus || authStatus === 'pending') && (
              <Typography className="title">{texts['004']}</Typography>
            )
          }
          {
            authStatus === 'finished' && (
              <Typography className="title">{texts['007']}</Typography>
            )
          }
        </div>
        {
          (!authStatus || authStatus === 'pending')
            ? (
              <Formik
                initialValues={{
                  name: '',
                  password: '',
                  confirmPassword: '',
                }}
                validate={(values) => {
                  const errors = {} as Record<string, any>;
                  if (!values.password) {
                    errors.password = texts['005'];
                  }
                  if (!values.confirmPassword) {
                    errors.confirmPassword = texts['006'];
                  }
                  return errors;
                }}
                onSubmit={(values, { setSubmitting }) => {
                  if (values.password !== values.confirmPassword) {
                    AppAlertManager.create(texts['009'], { variant: 'error' });
                    setSubmitting(false);
                  }
                  if (type === 'forget_password') {
                    completeResetPassword(values.password, type)
                      .then((res) => {
                        if (res) {
                          setAuthStatus('finished');
                          setTimeout(() => {
                            history.push('/');
                          }, 2000);
                        }
                      })
                      .finally(() => setSubmitting(false));
                  }
                  if (type === 'registration') {
                    completeRegistration(values.name, values.password, type)
                      .then((res) => {
                        if (res) {
                          setAuthStatus('finished');
                          setTimeout(() => {
                            history.push('/');
                          }, 2000);
                        }
                      })
                      .finally(() => setSubmitting(false));
                  }
                }}
              >
                {({ submitForm, isSubmitting }) => (
                  <Form className="app-form app-page-complete__card__form">
                    {
                      type === 'registration' && (
                        <Field
                          component={TextField}
                          name="name"
                          type="text"
                          label={texts['010']}
                          variant="outlined"
                          className="input-wrapper"
                          InputProps={{
                            className: 'input',
                          }}
                        />
                      )
                    }
                    <Field
                      component={TextField}
                      name="password"
                      type="password"
                      label={texts['001']}
                      variant="outlined"
                      className="input-wrapper"
                      InputProps={{
                        className: 'input',
                      }}
                    />
                    <Field
                      component={TextField}
                      type="password"
                      label={texts['002']}
                      name="confirmPassword"
                      variant="outlined"
                      className="input-wrapper"
                      InputProps={{
                        className: 'input',
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      className="button-wrapper"
                      disabled={isSubmitting}
                      onClick={submitForm}
                    >{texts['003']}</Button>
                    {isSubmitting && <LinearProgress />}
                  </Form>
                )}
              </Formik>
            )
            : <>
              <Typography variant="subtitle1" style={{ textAlign: 'center' }}>{texts['008']}</Typography>
            </>
        }
      </Card>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(CompletePage);
