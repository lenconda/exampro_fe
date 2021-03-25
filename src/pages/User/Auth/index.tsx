import React, { useState } from 'react';
import { Button, Card, Checkbox, CssBaseline, FormControlLabel, LinearProgress, Typography } from '@material-ui/core';
import { Field, Form as FormikForm, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import { Fingerprint } from 'mdi-material-ui';
import { connect } from 'react-redux';
import { ConnectState } from '../../../models';
import { AppState } from '../../../models/app';
import { getEmailAuthType, login } from './service';
import { useHistory } from 'react-router-dom';
import _ from 'lodash';
import { Base64 } from 'js-base64';
import './index.less';

const Form = FormikForm as any;

export interface AuthPageProps extends AppState {}

const AuthPage: React.FC<AuthPageProps> = (props) => {
  const [authStatus, setAuthStatus] = useState<'login' | 'register'>(null);
  const texts = props.i18n[props.locale].ui['/user/auth'];
  const history = useHistory();

  return (
    <div className="app-page app-page-auth">
      <img src="/assets/images/logo_text.svg" className="app-page-auth__logo" />
      <Card classes={{ root: 'app-page-auth__card' }} elevation={0}>
        <div className="app-page-auth__card__icons">
          <CssBaseline />
          <Fingerprint fontSize="large" className="icon" />
          <Typography className="title">{texts['001']}</Typography>
        </div>
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
            if (!authStatus) {
              getEmailAuthType(email)
                .then((type) => {
                  setAuthStatus(type);
                })
                .finally(() => setSubmitting(false));
            }
            if (authStatus === 'login') {
              login(email, password)
                .then((res) => {
                  if (res) {
                    const location = (_.get(history, 'location.search') || '').slice(1);
                    if (location.redirect) {
                      history.push(Base64.decode(location.redirect));
                    } else {
                      history.push('/');
                    }
                  }
                })
                .finally(() => setSubmitting(false));
            }
          }}
        >
          {({ submitForm, isSubmitting }) => (
            <Form className="app-form app-page-auth__card__form">
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
              {isSubmitting && <LinearProgress />}
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(AuthPage);
