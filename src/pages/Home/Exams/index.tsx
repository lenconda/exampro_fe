import { createStyles, makeStyles, Paper, Grid, Tab, Tabs, Theme, Typography, InputBase, Button, CircularProgress } from '@material-ui/core';
import clsx from 'clsx';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router';
import { Dispatch, Exam, ExamRole } from '../../../interfaces';
import { ConnectState } from '../../../models';
import { AppState } from '../../../models/app';
import { usePageTexts, useTexts } from '../../../utils/texts';
import { getExamRoleTypes, queryExams } from './service';
import { useLocationQuery } from '../../../utils/history';
import qs from 'qs';
import { NotePlus } from 'mdi-material-ui';
import { usePaginationRequest, useRequest } from '../../../utils/request';
import './index.less';
import AppTable, { TableSchema } from '../../../components/AppTable';

export interface ExamPageProps extends Dispatch, AppState {}

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
  },
  wrapperPaper: {
    textAlign: 'center',
    color: theme.palette.text.secondary,
    backgroundColor: 'transparent',
  },
  roleTabItem: {
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(4),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(4),
  },
}));

const ExamsPage: React.FC<ExamPageProps> = ({
  dispatch,
}) => {
  const classes = useStyles();
  const examRoleTexts = useTexts(dispatch, 'examRoles');
  const systemTexts = useTexts(dispatch, 'system');
  const history = useHistory();
  const roleId = useLocationQuery('role') as string;
  const texts = usePageTexts(dispatch, '/home/exams');
  const [selectedRoleIndex, setSelectedRoleIndex] = useState<number>(0);
  const [queryExamsInputFocused, setQueryExamsInputFocused] = useState<boolean>(false);
  const [roles = [], rolesLoading] = useRequest<ExamRole[]>(getExamRoleTypes, [examRoleTexts]);
  const [
    examItems,
    totalExams,
    queryExamsLoading,
  ] = usePaginationRequest<Exam>(queryExams, { role: roleId });
  const [schema, setSchema] = useState<TableSchema[]>([]);

  useEffect(() => {
    const queries = qs.parse(_.get(history, 'location.search').slice(1));
    if (!roleId && roles.length > 0) {
      history.push({
        search: qs.stringify({
          ...queries,
          role: roles[0].id,
        }),
      });
    }
    if (roleId && roles.length > 0) {
      setSelectedRoleIndex(roles.findIndex((role) => role.id === roleId));
    }
  }, [roleId, roles]);

  useEffect(() => {
    if (!_.isEmpty(systemTexts)) {
      setSchema([
        {
          title: texts['003'],
          key: 'title',
        },
      ]);
    }
  }, [systemTexts, texts]);

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
          md={3}
          lg={2}
          xl={1}
          classes={{ root: 'item' }}
        >
          <Paper
            elevation={0}
            classes={{ root: clsx(classes.wrapperPaper, 'app-exams-roles-card') }}
          >
            {
              rolesLoading
                ? (
                  <div className="app-loading">
                    <CircularProgress classes={{ root: 'app-loading__icon' }} color="primary" />
                  </div>
                )
                : (
                  <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    value={selectedRoleIndex}
                    indicatorColor="primary"
                    classes={{
                      root: 'app-exams-roles-card__tabs',
                      indicator: 'app-exams-roles-card__indicator',
                    }}
                  >
                    {
                      roles.map((role, index) => (
                        <Tab
                          key={index}
                          label={
                            <Typography
                              noWrap={true}
                              variant="body1"
                            >{role.description}</Typography>
                          }
                          classes={{
                            root: clsx('app-exams-roles-card__tabs__item', classes.roleTabItem),
                            wrapper: 'app-exams-roles-card__tabs__item__wrapper',
                          }}
                          onClick={() => {
                            history.push({
                              search: qs.stringify({
                                ...qs.parse(_.get(history, 'location.search').slice(1)),
                                role: role.id,
                              }),
                            });
                          }}
                        />
                      ))
                    }
                  </Tabs>
                )
            }
          </Paper>
        </Grid>
        <Grid
          item={true}
          xs={12}
          sm={12}
          md={9}
          lg={10}
          xl={11}
          classes={{ item: 'item' }}
        >
          <Paper
            elevation={0}
            classes={{ root: classes.wrapperPaper }}
          >
            <div className="app-page-interact-wrapper">
              <Paper
                classes={{ root: 'app-search-wrapper' }}
              >
                <InputBase
                  classes={{
                    root: 'app-search-wrapper__input__root',
                    input: 'app-search-wrapper__input__input',
                  }}
                  placeholder={texts['001']}
                  onFocus={() => setQueryExamsInputFocused(true)}
                  onBlur={() => setQueryExamsInputFocused(false)}
                />
              </Paper>
              <Button
                classes={{
                  root: clsx(
                    'app-page-interact-wrapper__button',
                    queryExamsInputFocused ? 'collapsed' : '',
                  ),
                }}
                color="primary"
                startIcon={!queryExamsInputFocused ? <NotePlus /> : null}
                variant="contained"
              >{!queryExamsInputFocused ? texts['002'] : null}</Button>
            </div>
            <div className="app-page-table-wrapper">
              <AppTable loading={queryExamsLoading} />
            </div>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(ExamsPage);
