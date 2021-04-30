import { deleteExams, getExamRoleTypes, getExamStatus, queryExams } from './service';
import StatusChip from './components/StatusChip';
import ExamCard from './components/ExamCard';
import { Dispatch, Exam, ExamRole } from '../../../interfaces';
import { ConnectState } from '../../../models';
import { AppState } from '../../../models/app';
import { usePageTexts, useTexts } from '../../../utils/texts';
import { pushSearch, useLocationQuery } from '../../../utils/history';
import { usePaginationRequest, useRequest } from '../../../utils/request';
import AppTable, { TableSchema } from '../../../components/AppTable';
import { useDebouncedValue, useUpdateEffect } from '../../../utils/hooks';
import AppDialogManager from '../../../components/AppDialog/Manager';
import AppSearchBar from '../../../components/AppSearchBar';
import AppExamEditor from '../../../components/AppExamEditor';
import clsx from 'clsx';
import _ from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router';
import qs from 'qs';
import Delete from 'mdi-material-ui/Delete';
import NotePlus from 'mdi-material-ui/NotePlus';
import { createStyles, makeStyles, useTheme, useMediaQuery, Theme } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import TablePagination from '@material-ui/core/TablePagination';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import FileDocumentEdit from 'mdi-material-ui/FileDocumentEdit';
import FileQuestion from 'mdi-material-ui/FileQuestion';
import FileEye from 'mdi-material-ui/FileEye';
import './index.less';

export interface ExamPageProps extends Dispatch, AppState {}

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
  },
  wrapperPaper: {
    textAlign: 'center',
    color: theme.palette.text.secondary,
    backgroundColor: 'transparent',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  roleTabItem: {
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(4),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(4),
  },
  participantGridContainer: {
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  },
  disappear: {
    display: 'none',
  },
}));

const ExamsPage: React.FC<ExamPageProps> = ({
  dispatch,
}) => {
  const classes = useStyles();
  const examRoleTexts = useTexts(dispatch, 'examRoles');
  const systemTexts = useTexts(dispatch, 'system');
  const tableTexts = useTexts(dispatch, 'table');
  const history = useHistory();
  const roleId = useLocationQuery('role') as string;
  const texts = usePageTexts(dispatch, '/home/exams');
  const [selectedRoleIndex, setSelectedRoleIndex] = useState<number>(0);
  const [roles = [], rolesLoading] = useRequest<ExamRole[]>(getExamRoleTypes, [examRoleTexts]);
  const [
    examItems = [],
    totalExams = 0,
    queryExamsLoading,
    page,
    size,
  ] = usePaginationRequest<Exam>(queryExams, { roles: roleId });
  const [schema, setSchema] = useState<TableSchema[]>([]);
  const theme = useTheme();
  const matchSm = useMediaQuery(theme.breakpoints.down('sm'));
  const tabs = useRef<HTMLButtonElement>(undefined);
  const [tabsFlexBasis, setTabsFlexBasis] = useState<number>(0);
  const [searchValue, setSearchValue] = useState<string>(undefined);
  const debouncedSearchValue = useDebouncedValue(searchValue);
  const defaultSearch = useLocationQuery('search') as string;
  const [selectedExams, setSelectedExams] = useState<Exam[]>([]);
  const [loadMoreMode, setLoadMoreMode] = useState<boolean>(false);
  const [examsOpen, setExamsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!roleId && roles.length > 0) {
      history.push(pushSearch(history, {
        role: roles[0].id,
      }));
    }
    if (roleId && roles.length > 0) {
      setSelectedRoleIndex(roles.findIndex((role) => role.id === roleId));
    }
  }, [roleId, roles]);

  useUpdateEffect(() => {
    if (roleId) {
      history.push(pushSearch(history, {
        page: undefined,
        size: undefined,
        last_cursor: undefined,
      }));
      setLoadMoreMode(false);
    }
  }, [roleId]);

  useEffect(() => {
    if (!_.isEmpty(systemTexts) && !_.isEmpty(texts)) {
      setSchema([
        {
          title: texts['003'],
          key: 'title',
        },
        {
          title: texts['013'],
          key: 'startTime',
          minWidth: 64,
          render: (row) => {
            const status = getExamStatus(row);
            return <StatusChip status={status} />;
          },
        },
        {
          title: texts['004'],
          key: 'public',
          minWidth: 80,
          render: (row, value) => (value ? systemTexts['TRUE'] : systemTexts['FALSE']),
        },
        {
          title: texts['005'],
          key: 'grades',
          minWidth: 80,
          render: (row, value) => (value ? systemTexts['TRUE'] : systemTexts['FALSE']),
        },
        {
          title: texts['006'],
          key: 'startTime',
          minWidth: 160,
          render: (row, value) => (value ? new Date(value).toLocaleString() : systemTexts['NULL']),
        },
        {
          title: texts['007'],
          key: 'endTime',
          minWidth: 160,
          render: (row, value) => new Date(value).toLocaleString(),
        },
        {
          title: texts['008'],
          key: 'duration',
          minWidth: 100,
          render: (row, value) => (value ? value : texts['009']),
        },
      ]);
    }
  }, [systemTexts, texts]);

  useEffect(() => {
    if (matchSm && tabs.current) {
      setTabsFlexBasis((tabs.current.clientHeight || 48) + 24);
    }
  }, [tabs, matchSm]);

  useEffect(() => {
    if (debouncedSearchValue !== undefined) {
      history.push(pushSearch(history, {
        search: debouncedSearchValue,
      }));
    }
  }, [debouncedSearchValue]);

  return (
    <div className="app-page app-page-home__exams">
      <Grid
        container={true}
        spacing={3}
        classes={{
          container: clsx('app-grid-container', {
            column: matchSm,
          }),
        }}
      >
        <Grid
          item={true}
          xs={12}
          sm={12}
          md={3}
          lg={2}
          xl={1}
          classes={{ root: 'item app-page-home__exams__tabs' }}
          style={
            (
              matchSm && tabsFlexBasis > 0
                ? {
                  flexBasis: tabsFlexBasis,
                }
                : {}
            )
          }
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
                    orientation={matchSm ? 'horizontal' : 'vertical'}
                    variant="scrollable"
                    value={selectedRoleIndex}
                    ref={tabs}
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
                            wrapper: clsx('app-exams-roles-card__tabs__item__wrapper', {
                              'center': matchSm,
                            }),
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
          classes={{
            item: 'item',
            root: 'app-page-home__exams__content',
          }}
        >
          <Paper
            elevation={0}
            classes={{ root: classes.wrapperPaper }}
          >
            <AppSearchBar
              search={defaultSearch}
              CreateIcon={NotePlus}
              onSearchChange={(search) => setSearchValue(search)}
              onCreateClick={() => {
                setExamsOpen(true);
              }}
            />
            <div
              className={clsx('app-page-table-wrapper', {
                scrollable: roleId === 'resource/exam/participant',
              })}
            >
              {
                queryExamsLoading
                  ? (
                    <div className="app-loading">
                      <CircularProgress classes={{ root: 'app-loading__icon' }} />
                    </div>
                  )
                  : examItems.length === 0
                    ? (
                      <div className="app-empty">
                        <FileQuestion classes={{ root: 'app-empty__icon' }} />
                        <Typography classes={{ root: 'app-empty__text' }}>{systemTexts['EMPTY']}</Typography>
                      </div>
                    )
                    : (
                      <>
                        <Grid
                          container={true}
                          spacing={2}
                          classes={{
                            root: clsx(classes.participantGridContainer, {
                              [classes.disappear]: roleId !== 'resource/exam/participant',
                            }),
                          }}
                        >
                          {
                            examItems.map((exam, index) => {
                              return (
                                <Grid
                                  key={index}
                                  item={true}
                                  xs={12}
                                  sm={12}
                                  md={6}
                                  lg={4}
                                  xl={3}
                                >
                                  <ExamCard exam={exam} />
                                </Grid>
                              );
                            })
                          }
                          <TablePagination
                            component={Box}
                            page={page - 1}
                            rowsPerPage={size}
                            count={totalExams}
                            rowsPerPageOptions={[5, 10, 20, 50]}
                            labelRowsPerPage={tableTexts['001']}
                            backIconButtonText={tableTexts['002']}
                            nextIconButtonText={tableTexts['003']}
                            labelDisplayedRows={({ from, to, count }) => `${count} ${tableTexts['004']} ${from}-${to}`}
                            onChangePage={(event, newPageNumber) => {
                              history.push({
                                search: pushSearch(history, {
                                  page: newPageNumber + 1,
                                }),
                              });
                            }}
                            onChangeRowsPerPage={(event) => {
                              history.push({
                                search: pushSearch(history, {
                                  size: event.target.value,
                                  page: 1,
                                }),
                              });
                            }}
                          />
                        </Grid>
                        <AppTable
                          schema={schema}
                          data={examItems}
                          loading={queryExamsLoading}
                          wrapperClassName={clsx({
                            [classes.disappear]: roleId === 'resource/exam/participant',
                          })}
                          toolbarButtons={[
                            {
                              Icon: FileDocumentEdit,
                              title: texts['011'],
                              show: selectedExams.length === 1
                                && ['resource/exam/initiator', 'resource/exam/maintainer'].includes(roleId)
                                && (selectedExams[0].startTime ? Date.parse(selectedExams[0].startTime) > Date.now() : true)
                                && Date.now() < Date.parse(selectedExams[0].endTime),
                              IconButtonProps: {
                              // TODO: push to edit exam page
                                onClick: () => {},
                              },
                            },
                            {
                              Icon: FileEye,
                              title: texts['012'],
                              show: selectedExams.length === 1
                                && selectedExams[0].startTime
                                && Date.now() >= Date.parse(selectedExams[0].startTime)
                                && Date.now() <= Date.parse(selectedExams[0].endTime)
                                && roleId === 'resource/exam/invigilator',
                              IconButtonProps: {
                              // TODO: push to invigilator page
                                onClick: () => {},
                              },
                            },
                            {
                              Icon: Delete,
                              title: texts['010'],
                              show: roleId === 'resource/exam/initiator',
                              IconButtonProps: {
                                onClick: () => {
                                  AppDialogManager.confirm(`${texts['014']} ${selectedExams.map((exam) => exam.title).join(', ')}`, {
                                    disableBackdropClick: true,
                                    onConfirm: () => {
                                      deleteExams(selectedExams).finally(() => {
                                        history.push({});
                                      });
                                    },
                                  });
                                },
                              },
                            },
                          ]}
                          TablePaginationProps={{
                            count: totalExams,
                            page: page - 1,
                            rowsPerPage: size,
                            onChangePage: (event, newPageNumber) => {
                              history.push({
                                search: pushSearch(history, {
                                  page: newPageNumber + 1,
                                }),
                              });
                            },
                            onChangeRowsPerPage: (event) => {
                              history.push({
                                search: pushSearch(history, {
                                  size: event.target.value,
                                  page: 1,
                                }),
                              });
                            },
                          }}
                          onSelectionChange={(items: Exam[]) => setSelectedExams(items)}
                        />
                      </>
                    )
              }
            </div>
          </Paper>
        </Grid>
      </Grid>
      <AppExamEditor
        open={examsOpen}
        onClose={() => setExamsOpen(false)}
      />
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(ExamsPage);
