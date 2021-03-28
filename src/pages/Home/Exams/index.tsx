import { createStyles, CssBaseline, Grid, makeStyles, Paper, Theme } from '@material-ui/core';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Dispatch, ExamRole } from '../../../interfaces';
import { ConnectState } from '../../../models';
import { AppState } from '../../../models/app';
import { useTexts } from '../../../utils/texts';
import './index.less';
import { getExamRoleTypes } from './service';

export interface ExamPageProps extends Dispatch, AppState {}

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

const ExamsPage: React.FC<ExamPageProps> = ({
  dispatch,
}) => {
  const classes = useStyles();
  const examRoleTexts = useTexts(dispatch, 'examRoles');
  const [roles, setRoles] = useState<ExamRole[]>([]);

  useEffect(() => {
    getExamRoleTypes(examRoleTexts).then((res) => {
      if (res) {
        setRoles(res);
      }
    });
  }, []);

  return (
    <div className="app-page app-page-home__exams">
      <Grid
        container={true}
        spacing={3}
        classes={{ container: 'app-grid-container' }}
      >
        <Grid
          item={true}
          xs={12}
          sm={12}
          md={4}
          lg={2}
          xl={1}
          classes={{ root: 'item' }}
        >
          <Paper
            elevation={0}
            classes={{ root: clsx(classes.paper, 'app-exams-roles-wrapper') }}
          >
          </Paper>
        </Grid>
        <Grid
          item={true}
          xs={12}
          sm={12}
          md={8}
          lg={10}
          xl={11}
          classes={{ item: 'item' }}
        >
          <Paper
            elevation={0}
            classes={{ root: classes.paper }}
          >xs</Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(ExamsPage);
