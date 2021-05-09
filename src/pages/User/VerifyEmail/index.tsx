import { verifyEmail } from './service';
import { ConnectState } from '../../../models';
import { AppState } from '../../../models/app';
import { Dispatch } from '../../../interfaces';
import { usePageTexts } from '../../../utils/texts';
import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CssBaseline from '@material-ui/core/CssBaseline';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import EmailCheckIcon from 'mdi-material-ui/EmailCheck';
import EmailRemoveIcon from 'mdi-material-ui/EmailRemove';
import ProgressClockIcon from 'mdi-material-ui/ProgressClock';
import ShieldAccountVariantIcon from 'mdi-material-ui/ShieldAccountVariant';
import { connect } from 'react-redux';
import { useHistory } from 'react-router';
import _ from 'lodash';
import './index.less';

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
              <ShieldAccountVariantIcon fontSize="large" className="icon" />
            )
          }
          {
            authStatus === 'pending' && (
              <ProgressClockIcon fontSize="large" className="icon" />
            )
          }
          {
            authStatus === 'succeeded' && (
              <EmailCheckIcon fontSize="large" className="icon" />
            )
          }
          {
            authStatus === 'failed' && (
              <EmailRemoveIcon fontSize="large" color="error" className="icon error" />
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
