import React, { useState } from 'react';
import { Button, Card, CssBaseline, LinearProgress, Typography } from '@material-ui/core';
import { EmailCheck, EmailRemove, ProgressClock, ShieldAccountVariant } from 'mdi-material-ui';
import { connect } from 'react-redux';
import { ConnectState } from '../../../models';
import { AppState } from '../../../models/app';
import { useHistory } from 'react-router-dom';
import _ from 'lodash';
import { verifyEmail } from './service';
import './index.less';
import { Dispatch } from '../../../interfaces';
import { usePageTexts } from '../../../utils/texts';

export interface CompletePageProps extends AppState, Dispatch {}

const CompletePage: React.FC<CompletePageProps> = (props) => {
  const [authStatus, setAuthStatus] = useState<'pending' | 'succeeded' | 'failed'>(null);
  const [errorCode, setErrorCode] = useState<string>('');
  const texts = usePageTexts(props.dispatch, '/user/verify_email');
  const history = useHistory();

  return (
    <div className="app-page app-page-verify--email">
      <img src="/assets/images/logo_text.svg" className="app-page-verify--email__logo" />
      <Card classes={{ root: 'app-page-verify--email__card' }} elevation={0}>
        <div className="app-page-verify--email__card__icons">
          <CssBaseline />
          {
            !authStatus && (
              <ShieldAccountVariant fontSize="large" className="icon" />
            )
          }
          {
            authStatus === 'pending' && (
              <ProgressClock fontSize="large" className="icon" />
            )
          }
          {
            authStatus === 'succeeded' && (
              <EmailCheck fontSize="large" className="icon" />
            )
          }
          {
            authStatus === 'failed' && (
              <EmailRemove fontSize="large" color="error" className="icon error" />
            )
          }
          {
            !authStatus && (
              <Typography className="title">{texts['006']}</Typography>
            )
          }
          {
            authStatus === 'pending' && (
              <Typography className="title">{texts['001']}</Typography>
            )
          }
          {
            authStatus === 'succeeded' && (
              <Typography className="title">{texts['002']}</Typography>
            )
          }
          {
            authStatus === 'failed' && (
              <Typography className="title">{texts['003']}</Typography>
            )
          }
        </div>
        <div className="app-page-verify--email__card__results">
          {
            (!authStatus || authStatus === 'pending') && (
              <Button
                fullWidth={true}
                variant="contained"
                color="primary"
                classes={{ root: 'button-wrapper' }}
                disabled={authStatus === 'pending'}
                onClick={() => {
                  setAuthStatus('pending');
                  verifyEmail().then((res) => {
                    if (res) {
                      setAuthStatus('succeeded');
                      setTimeout(() => {
                        history.push('/');
                      }, 2000);
                    }
                  }).catch((error) => {
                    const errorCode = _.get(error, 'response.data.message');
                    if (errorCode) {
                      setErrorCode(errorCode);
                    }
                    setAuthStatus('failed');
                  });
                }}
              >{texts['007']}</Button>
            )
          }
          {
            authStatus === 'pending' && (
              <LinearProgress />
            )
          }
          <Typography variant="subtitle1" style={{ textAlign: 'center' }}>
            {
              authStatus === 'succeeded' && texts['004']
            }
            {
              authStatus === 'failed' && (errorCode || texts['005'])
            }
          </Typography>
        </div>
      </Card>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(CompletePage);
