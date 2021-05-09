import { Dispatch, User } from '../../../../interfaces';
import { AppState } from '../../../../models/app';
import { connect } from '../../../../patches/dva';
import { ConnectState } from '../../../../models';
import { usePageTexts, useTexts } from '../../../../utils/texts';
import AppIndicator from '../../../../components/AppIndicator';
import { getUserProfile } from '../../service';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { makeStyles } from '@material-ui/core';
import _ from 'lodash';

export interface ProfilePageProps extends Dispatch, AppState {}

const useStyles = makeStyles((theme) => {
  return {
    profileWrapper: {
      padding: theme.spacing(5),
    },
    profileItemWrapper: {
      marginBottom: theme.spacing(6),
      maxWidth: 320,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    profileAvatar: {
      width: 64,
      height: 64,
      cursor: 'pointer',
    },
  };
});

const ProfilePage: React.FC<ProfilePageProps> = ({
  dispatch,
}) => {
  const history = useHistory();
  const classes = useStyles();
  const texts = usePageTexts(dispatch, '/home/account/profile');
  const systemTexts = useTexts(dispatch, 'system');
  const [profile, setProfile] = useState<User>(undefined);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);

  const getUserName = (profile: User) => {
    return profile.name || profile.email.split('@')[0];
  };

  const fetchUserProfile = () => {
    setProfileLoading(true);
    getUserProfile().then((profile) => {
      setProfile(profile);
    }).finally(() => setProfileLoading(false));
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <div className="app-page app-page-home__account">
      <div className="app-grid-container">
        <Box className={classes.profileWrapper}>
          {
            profileLoading
              ? <AppIndicator type="loading" />
              : profile
                ? (
                  <>
                    <Box className={classes.profileItemWrapper}>
                      <Box>
                        <Avatar
                          alt={getUserName(profile)}
                          src={profile.avatar}
                          classes={{ root: classes.profileAvatar }}
                        />
                      </Box>
                    </Box>
                    <Box className={classes.profileItemWrapper}>
                      <TextField
                        variant="outlined"
                        value={profile.name}
                        label={texts['002']}
                        fullWidth={true}
                        onChange={(event) => {
                          setProfile({
                            ...profile,
                            name: event.target.value,
                          });
                        }}
                      ></TextField>
                    </Box>
                  </>
                )
                : <AppIndicator type="empty" />
          }

        </Box>
      </div>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(ProfilePage);
