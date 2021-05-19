import { completeResetPassword, completeRegistration } from './service';
import { ConnectState } from '../../../models';
import { AppState } from '../../../models/app';
import { getQuery } from '../../../utils/qs';
import AppAlertManager from '../../../components/AppAlert/Manager';
import { Dispatch } from '../../../interfaces';
import { usePageTexts } from '../../../utils/texts';
import AppLanguageSelector from '../../../components/AppLanguageSelector';
import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CssBaseline from '@material-ui/core/CssBaseline';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import { Field, Form as FormikForm, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import ProgressCheckIcon from 'mdi-material-ui/ProgressCheck';
import ProgressClockIcon from 'mdi-material-ui/ProgressClock';
import { connect } from 'react-redux';
import { useHistory } from 'react-router';
import _ from 'lodash';
import './index.less';

const Form = FormikForm as any;

export interface CompletePageProps extends AppState, Dispatch {}

const CompletePage: React.FC<CompletePageProps> = (props) => {
  const [authStatus, setAuthStatus] = useState<'pending' | 'finished'>(null);
  const texts = usePageTexts(props.dispatch, '/user/complete');
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
              <ProgressClockIcon fontSize="large" className="icon" />
            )
          }
          {
            (authStatus === 'finished') && (
              <ProgressCheckIcon fontSize="large" className="icon" />
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
                  <Form
                    className="app-form app-page-complete__card__form"
                    onKeyDown={(e) => {
                      if (e && e.key && e.key === 'Enter') {
                        submitForm();
                      }
                    }}
                  >
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
        <AppLanguageSelector />
      </Card>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(CompletePage);
