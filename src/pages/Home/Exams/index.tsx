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
import AppIndicator from '../../../components/AppIndicator';
import clsx from 'clsx';
import _ from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router';
import qs from 'qs';
import { createStyles, makeStyles, useTheme, useMediaQuery, Theme } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import TablePagination from '@material-ui/core/TablePagination';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import DeleteIcon from 'mdi-material-ui/Delete';
import FileDocumentEditIcon from 'mdi-material-ui/FileDocumentEdit';
import FileEyeIcon from 'mdi-material-ui/FileEye';
import NotePlusIcon from 'mdi-material-ui/NotePlus';
import TextBoxCheckIcon from 'mdi-material-ui/TextBoxCheck';
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
}));

const ExamsPage: React.FC<ExamPageProps> = ({
  dispatch,
}) => {
  const classes = useStyles();
  const examRoleTexts = useTexts(dispatch, 'examRoles');
  const systemTexts = useTexts(dispatch, 'system');
  const tableTexts = useTexts(dispatch, 'table');
  const history = useHistory();
  const roleIdQuery = useLocationQuery('role') as string;
  const [roleId, setRoleId] = useState<string>('');
  const texts = usePageTexts(dispatch, '/home/exams');
  const [selectedRoleIndex, setSelectedRoleIndex] = useState<number>(0);
  const [roles = [], rolesLoading] = useRequest<ExamRole[]>(getExamRoleTypes, [examRoleTexts]);
  const [
    currentExamItems = [],
    totalExams = 0,
    queryExamsLoading,
    page,
    size,
    lastCursor,
    error,
    refresh,
  ] = usePaginationRequest<Exam>(queryExams, { roles: roleId }, false);
  const [examItems, setExamItems] = useState<Exam[]>([]);
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

  const [examEditorOpen, setExamEditorOpen] = useState<boolean>(false);
  const [examEditorMode, setExamEditorMode] = useState<'create' | 'edit'>('create');

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

  useEffect(() => {
    if (roleIdQuery && roleId !== roleIdQuery) {
      setRoleId(roleIdQuery);
    }
  }, [roleIdQuery]);

  useEffect(() => {
    setExamItems(currentExamItems);
  }, [currentExamItems]);

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
                  <AppIndicator type="loading" />
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
                            setExamItems([]);
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
              CreateIcon={NotePlusIcon}
              onSearchChange={(search) => setSearchValue(search)}
              onCreateClick={() => {
                setExamEditorMode('create');
                setExamEditorOpen(true);
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
                    <AppIndicator type="loading" />
                  )
                  : examItems.length === 0
                    ? (
                      <AppIndicator type="empty" />
                    )
                    : (
                      roleId === 'resource/exam/participant'
                        ? (
                          <Grid
                            container={true}
                            spacing={2}
                            classes={{
                              root: clsx(classes.participantGridContainer),
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
                          </Grid>
                        )
                        : (
                          <AppTable
                            schema={schema}
                            data={examItems}
                            loading={queryExamsLoading}
                            toolbarButtons={[
                              {
                                Icon: FileDocumentEditIcon,
                                title: texts['011'],
                                show: selectedExams.length === 1
                                && ['resource/exam/initiator', 'resource/exam/maintainer'].includes(roleId)
                                && (selectedExams[0].startTime ? Date.parse(selectedExams[0].startTime) > Date.now() : true)
                                && Date.now() < Date.parse(selectedExams[0].endTime),
                                IconButtonProps: {
                                  onClick: () => {
                                    setExamEditorMode('edit');
                                    setExamEditorOpen(true);
                                  },
                                },
                              },
                              {
                                Icon: TextBoxCheckIcon,
                                title: texts['015'],
                                show: selectedExams.length === 1
                                && ['resource/exam/reviewer'].includes(roleId)
                                && Date.parse(selectedExams[0].endTime) < Date.now()
                                && Date.now() < Date.parse(selectedExams[0].resultTime),
                                IconButtonProps: {
                                  onClick: () => {
                                    history.push(`/home/exams/review_list/${selectedExams[0].id}`);
                                  },
                                },
                              },
                              {
                                Icon: FileEyeIcon,
                                title: texts['012'],
                                show: selectedExams.length === 1
                                  && selectedExams[0].startTime
                                  && Date.now() >= Date.parse(selectedExams[0].startTime)
                                  && roleId === 'resource/exam/invigilator',
                                IconButtonProps: {
                                  onClick: () => {
                                    history.push(`/home/exams/invigilate/${selectedExams[0].id}`);
                                  },
                                },
                              },
                              {
                                Icon: DeleteIcon,
                                title: texts['010'],
                                show: roleId === 'resource/exam/initiator',
                                IconButtonProps: {
                                  onClick: () => {
                                    AppDialogManager.confirm(`${texts['014']} ${selectedExams.map((exam) => exam.title).join(', ')}`, {
                                      disableBackdropClick: true,
                                      onConfirm: () => {
                                        deleteExams(selectedExams).finally(() => {
                                          refresh();
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
                        )
                    )
              }
            </div>
            {
              (roleId === 'resource/exam/participant' && examItems.length > 0 && !queryExamsLoading) && (
                <Grid container={true}>
                  <Grid
                    item={true}
                    xs={12}
                    sm={12}
                    md={12}
                    lg={12}
                    xl={12}
                  >
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
                </Grid>
              )
            }
          </Paper>
        </Grid>
      </Grid>
      <AppExamEditor
        open={examEditorOpen}
        exam={selectedExams[0]}
        mode={examEditorMode}
        roleId={roleId}
        onClose={() => setExamEditorOpen(false)}
        onSubmitExam={() => {
          setExamEditorOpen(false);
          refresh();
        }}
      />
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(ExamsPage);
