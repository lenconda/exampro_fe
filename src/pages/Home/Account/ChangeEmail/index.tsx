import { changeUserEmail } from './service';
import { Dispatch } from '../../../../interfaces';
import { AppState } from '../../../../models/app';
import { connect } from '../../../../patches/dva';
import { ConnectState } from '../../../../models';
import { usePageTexts, useTexts } from '../../../../utils/texts';
import { encodeRedirectPathname } from '../../../../utils/redirect';
import { logout } from '../../service';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import EmailCheckIcon from 'mdi-material-ui/EmailCheck';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { makeStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import clsx from 'clsx';

const emailValidationRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

export interface ChangeEmailPageProps extends Dispatch, AppState {}

const useStyles = makeStyles((theme) => {
  return {
    changeEmailWrapper: {
      padding: theme.spacing(5),
      maxHeight: '100%',
      overflowY: 'scroll',
    },
    itemWrapper: {
      marginBottom: theme.spacing(5),
      maxWidth: 320,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      '& > button': {
        marginRight: theme.spacing(2),
      },
    },
    submittedWrapper: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    submittedCard: {
      maxWidth: 360,
    },
  };
});

const ChangeEmailPage: React.FC<ChangeEmailPageProps> = ({
  dispatch,
}) => {
  const history = useHistory();
  const classes = useStyles();
  const texts = usePageTexts(dispatch, '/home/account/change_email');
  const systemTexts = useTexts(dispatch, 'system');
  const [newEmail, setNewEmail] = useState<string>();
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const updateUserEmail = (newEmail: string) => {
    if (!emailValidationRegex.test(newEmail)) { return }
    setSubmitting(true);
    changeUserEmail(newEmail).then(() => {
      setSubmitted(true);
    }).catch(() => {}).finally(() => setSubmitting(false));
  };

  const backToAuth = () => {
    const redirect = encodeRedirectPathname(history.location);
    logout(redirect).then((res) => {
      if (res) {
        history.push(res || '/user/auth');
      }
    });
  };

  useEffect(() => {
    let timeout;
    if (submitted) {
      timeout = setTimeout(() => {
        backToAuth();
      }, 5000);
    }
    return () => clearTimeout(timeout);
  }, [submitted]);

  return (
    <div className="app-page app-page-home__account">
      <div
        className={clsx('app-grid-container', {
          [classes.submittedWrapper]: submitted,
        })}
      >
        {
          submitted
            ? (
              <Card variant="outlined" classes={{ root: classes.submittedCard }}>
                <CardContent>
                  <Typography variant="body1" classes={{ root: 'app-icon-typography card-title' }}>
                    <EmailCheckIcon color="primary" fontSize="large" />
                    {texts['002']}
                  </Typography>
                </CardContent>
                <CardContent>
                  <Typography gutterBottom={true}>{texts['003']}</Typography>
                </CardContent>
                <CardContent>
                  <Button
                    variant="outlined"
                    fullWidth={true}
                    onClick={() => backToAuth()}
                  >{systemTexts['LOGOUT']}</Button>
                </CardContent>
              </Card>
            )
            : (
              <Card classes={{ root: classes.changeEmailWrapper }}>
                <Box className={classes.itemWrapper}>
                  <TextField
                    variant="outlined"
                    label={texts['001']}
                    fullWidth={true}
                    value={newEmail}
                    onChange={(event) => setNewEmail(event.target.value)}
                  />
                </Box>
                <Box className={classes.itemWrapper}>
                  <Button
                    color="primary"
                    variant="outlined"
                    disabled={!(emailValidationRegex.test(newEmail)) || submitting}
                    onClick={() => updateUserEmail(newEmail)}
                  >{!submitting ? systemTexts['SUBMIT'] : systemTexts['SUBMITTING']}</Button>
                </Box>
              </Card>
            )
        }
      </div>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(ChangeEmailPage);
