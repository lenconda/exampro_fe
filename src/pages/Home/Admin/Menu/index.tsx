import { Dispatch } from '../../../../interfaces';
import { AppState } from '../../../../models/app';
import { connect } from '../../../../patches/dva';
import { ConnectState } from '../../../../models';
import { usePageTexts } from '../../../../utils/texts';
import Card from '@material-ui/core/Card';
import React from 'react';
import { useHistory } from 'react-router';
import { makeStyles } from '@material-ui/core';
import _ from 'lodash';

export interface ProfilePageProps extends Dispatch, AppState {}

const useStyles = makeStyles((theme) => {
  return {
    menuTreeWrapper: {
      padding: theme.spacing(5),
      maxHeight: '100%',
      overflowY: 'scroll',
    },
  };
});

const ProfilePage: React.FC<ProfilePageProps> = ({
  dispatch,
}) => {
  const history = useHistory();
  const classes = useStyles();
  const texts = usePageTexts(dispatch, '/home/admin/menu');

  return (
    <div className="app-page app-page-admin__menu">
      <div className="app-grid-container">
        <Card classes={{ root: classes.menuTreeWrapper }}>
        </Card>
      </div>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(ProfilePage);
