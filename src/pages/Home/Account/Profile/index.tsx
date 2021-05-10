import { patchUserPassword, patchUserProfile } from './service';
import { ChangePasswordState, Dispatch, User } from '../../../../interfaces';
import { AppState } from '../../../../models/app';
import { connect } from '../../../../patches/dva';
import { ConnectState } from '../../../../models';
import { usePageTexts, useTexts } from '../../../../utils/texts';
import AppIndicator from '../../../../components/AppIndicator';
import { getUserProfile } from '../../service';
import AppAlertManager from '../../../../components/AppAlert/Manager';
import { uploadImage } from '../../../../service';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import ShieldEditOutlineIcon from 'mdi-material-ui/ShieldEditOutline';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { makeStyles } from '@material-ui/core';
import _ from 'lodash';

export interface ProfilePageProps extends Dispatch, AppState {}

const defaultChangePasswordState: ChangePasswordState = {
  old: '',
  new: '',
  confirm: '',
};

const useStyles = makeStyles((theme) => {
  return {
    profileWrapper: {
      padding: theme.spacing(5),
      maxHeight: '100%',
      overflowY: 'scroll',
    },
    profileItemWrapper: {
      marginBottom: theme.spacing(5),
      maxWidth: 320,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      '& > button': {
        marginRight: theme.spacing(2),
      },
    },
    profileAvatar: {
      width: '100%',
      height: '100%',
    },
    profileAvatarWrapper: {
      position: 'relative',
      cursor: 'pointer',
      width: 64,
      height: 64,
      overflow: 'hidden',
      '& > input:first-child': {
        cursor: 'pointer',
        opacity: 0,
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 1,
      },
    },
  };
});

const validateChangePasswordState = (currentState: ChangePasswordState) => {
  const { old, new: newPassword, confirm } = currentState;
  if (!(old && newPassword && confirm) || newPassword !== confirm) {
    return false;
  }
  return true;
};

const ProfilePage: React.FC<ProfilePageProps> = ({
  dispatch,
}) => {
  const history = useHistory();
  const classes = useStyles();
  const texts = usePageTexts(dispatch, '/home/account/profile');
  const sidebarMenuTexts = useTexts(dispatch, 'sidebarMenu');
  const systemTexts = useTexts(dispatch, 'system');
  const [profile, setProfile] = useState<User>(undefined);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [updateProfileLoading, setUpdateProfileLoading] = useState<boolean>(false);
  const [newAvatarFile, setNewAvatarFile] = useState<File>(undefined);
  const [changePasswordState, setChangePasswordState] = useState<ChangePasswordState>(_.clone(defaultChangePasswordState));
  const [changePasswordLoading, setChangePasswordLoading] = useState<boolean>(false);

  const getUserName = (profile: User) => {
    if (!profile || _.isEmpty(profile)) {
      return '';
    }
    return profile.name || profile.email.split('@')[0];
  };

  const fetchUserProfile = () => {
    setProfileLoading(true);
    getUserProfile().then((profile) => {
      setProfile(profile);
    }).finally(() => setProfileLoading(false));
  };

  const updateUserProfile = (profile: Partial<User>) => {
    setUpdateProfileLoading(true);
    patchUserProfile(profile).then(() => {
      AppAlertManager.create(systemTexts['SAVED_SUCCESSFULLY'], {
        variant: 'success',
      });
    }).catch(() => {}).finally(() => setUpdateProfileLoading(false));
  };

  const updateUserPassword = (changePasswordState: ChangePasswordState) => {
    const { new: newPassword, confirm } = changePasswordState;
    if (newPassword !== confirm) {
      AppAlertManager.create(texts['006'], {
        variant: 'error',
      });
      return;
    }
    setChangePasswordLoading(true);
    patchUserPassword(changePasswordState).then(() => {
      AppAlertManager.create(systemTexts['UPDATED_SUCCESSFULLY'], {
        variant: 'success',
      });
    }).catch(() => {}).finally(() => {
      setChangePasswordState(_.clone(defaultChangePasswordState));
      setChangePasswordLoading(false);
    });
  };

  useEffect(() => {
    if (newAvatarFile) {
      uploadImage(newAvatarFile).then((url) => {
        setProfile({
          ...profile,
          avatar: url,
        });
      });
    }
  }, [newAvatarFile]);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <div className="app-page app-page-home__account">
      <div className="app-grid-container">
        <Card classes={{ root: classes.profileWrapper }}>
          {
            profileLoading
              ? <AppIndicator type="loading" />
              : profile
                ? (
                  <>
                    <Box className={classes.profileItemWrapper}>
                      <Box className={classes.profileAvatarWrapper}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => {
                            setNewAvatarFile(event.target.files![0]);
                          }}
                        />
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
                      />
                    </Box>
                    <Box className={classes.profileItemWrapper}>
                      <Button
                        variant="outlined"
                        color="primary"
                        disabled={updateProfileLoading}
                        onClick={() => updateUserProfile(profile)}
                      >{updateProfileLoading ? systemTexts['SAVING'] : systemTexts['SAVE']}</Button>
                    </Box>
                    <Box className={classes.profileItemWrapper}>
                      <TextField
                        variant="outlined"
                        value={changePasswordState.old}
                        type="password"
                        label={texts['003']}
                        fullWidth={true}
                        onChange={(event) => {
                          setChangePasswordState({
                            ...changePasswordState,
                            old: event.target.value,
                          });
                        }}
                      />
                    </Box>
                    <Box className={classes.profileItemWrapper}>
                      <TextField
                        variant="outlined"
                        value={changePasswordState.new}
                        type="password"
                        label={texts['004']}
                        fullWidth={true}
                        onChange={(event) => {
                          setChangePasswordState({
                            ...changePasswordState,
                            new: event.target.value,
                          });
                        }}
                      />
                    </Box>
                    <Box className={classes.profileItemWrapper}>
                      <TextField
                        variant="outlined"
                        value={changePasswordState.confirm}
                        type="password"
                        label={texts['005']}
                        fullWidth={true}
                        onChange={(event) => {
                          setChangePasswordState({
                            ...changePasswordState,
                            confirm: event.target.value,
                          });
                        }}
                      />
                    </Box>
                    <Box className={classes.profileItemWrapper}>
                      <Button
                        color="primary"
                        variant="outlined"
                        disabled={!validateChangePasswordState(changePasswordState) || changePasswordLoading}
                        onClick={() => updateUserPassword(changePasswordState)}
                      >{changePasswordLoading ? systemTexts['UPDATING'] : systemTexts['UPDATE']}</Button>
                      <Button
                        onClick={() => {
                          setChangePasswordState(_.clone(defaultChangePasswordState));
                        }}
                      >{systemTexts['RESET']}</Button>
                    </Box>
                    <Divider variant="fullWidth" />
                    <Box className={classes.profileItemWrapper} />
                    <Box className={classes.profileItemWrapper}>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<ShieldEditOutlineIcon />}
                        onClick={() => {
                          history.push('/home/account/change_email');
                        }}
                      >{sidebarMenuTexts['ACCOUNT_SETTINGS/CHANGE_EMAIL']}</Button>
                    </Box>
                  </>
                )
                : <AppIndicator type="empty" />
          }
        </Card>
      </div>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(ProfilePage);
