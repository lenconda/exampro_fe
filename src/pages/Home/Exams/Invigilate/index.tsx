import { changeFraudStatus, queryExamParticipantsWithUserExamRelation } from './service';
import { Dispatch, ExamResponseData, User, UserExam } from '../../../../interfaces';
import { AppState } from '../../../../models/app';
import { connect } from '../../../../patches/dva';
import { ConnectState } from '../../../../models';
import { usePageTexts, useTexts } from '../../../../utils/texts';
import { getExamInfo } from '../../../../components/AppExamContainer/service';
import { checkInvigilatePermission } from '../../../../utils/exam';
import AppIndicator from '../../../../components/AppIndicator';
import { usePaginationRequest } from '../../../../utils/request';
import AppTable, { TableSchema } from '../../../../components/AppTable';
import { pushSearch } from '../../../../utils/history';
import { ChannelType } from '../../../../components/AppRecorder';
import AppDialogManager from '../../../../components/AppDialog/Manager';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import AccountAlertOutlineIcon from 'mdi-material-ui/AccountAlertOutline';
import AccountRemoveOutlineIcon from 'mdi-material-ui/AccountRemoveOutline';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import FileClockIcon from 'mdi-material-ui/FileClock';
import MonitorIcon from 'mdi-material-ui/Monitor';
import VideoOutlineIcon from 'mdi-material-ui/VideoOutline';
import RefreshOutlinedIcon from '@material-ui/icons/RefreshOutlined';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { makeStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import clsx from 'clsx';

export interface InvigilatePageProps extends Dispatch, AppState {}

const useStyles = makeStyles((theme) => {
  return {
    controlButtonsWrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      '& button': {
        marginRight: theme.spacing(1),
      },
      '& button:last-child': {
        marginRight: 0,
      },
    },
    contentWrapper: {
      paddingTop: theme.spacing(3),
    },
    contentTableWrapper: {
      marginTop: theme.spacing(3),
      '& > div:first-child': {
        padding: 0,
      },
    },
    reportFraudButton: {
      color: theme.palette.warning.main,
    },
    cancelReportFraudButton: {
      color: theme.palette.success.main,
    },
  };
});

const InvigilatePage: React.FC<InvigilatePageProps> = ({
  dispatch,
}) => {
  const history = useHistory();
  const classes = useStyles();
  const params = useParams() as Record<string, string>;
  const texts = usePageTexts(dispatch, '/home/exams/invigilate');
  const systemTexts = useTexts(dispatch, 'system');
  const [examLoading, setExamLoading] = useState<boolean>(true);
  const [exam, setExam] = useState<ExamResponseData>(undefined);
  const [
    examParticipants = [],
    totalExamParticipants = 0,
    queryExamParticipantsLoading,
    page,
    size,
    lastCursor,
    error,
    refreshQueryExamParticipants,
  ] = usePaginationRequest<UserExam>(queryExamParticipantsWithUserExamRelation(_.get(exam, 'id')), {});
  const [schema, setSchema] = useState<TableSchema[]>([]);

  const fetchExamInfo = (id: number) => {
    setExamLoading(true);
    getExamInfo(id, 'invigilate').then((info) => {
      setExam(info);
    }).finally(() => {
      setExamLoading(false);
    });
  };

  const handleJumpMediaPage = (examId: number, type: ChannelType) => {
    window.open(`/home/exams/invigilate/recording/${examId}?type=${type}`, '_blank');
  };

  const handleChangeFraudStatus = (examId: number, participantEmail: string, status: boolean) => {
    const message = status ? texts['014'] : texts['015'];
    AppDialogManager.confirm(message, {
      onConfirm: () => {
        changeFraudStatus(examId, participantEmail, status).finally(() => {
          refreshQueryExamParticipants();
        });
      },
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTimestamp = Date.now();
      if (exam && Date.parse(exam.endTime) < currentTimestamp) {
        clearInterval(interval);
        return;
      }
      const { id } = params;
      const currentExamId = parseInt(id, 10);
      if (!queryExamParticipantsLoading && id && _.isNumber(currentExamId)) {
        refreshQueryExamParticipants();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [queryExamParticipantsLoading, exam]);

  useEffect(() => {
    const { id } = params;
    const currentExamId = parseInt(id, 10);
    if (id && _.isNumber(currentExamId)) {
      fetchExamInfo(currentExamId);
    } else {
      setExamLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!_.isEmpty(systemTexts) && !_.isEmpty(texts)) {
      setSchema([
        {
          title: texts['003'],
          key: 'user.avatar',
          render: (row, value) => {
            return <Avatar src={value} />;
          },
        },
        {
          title: texts['004'],
          key: 'user.name',
          render: (row: UserExam, value) => {
            return value || (_.get(row, 'user.email') as string || '').split('@')[0] || '-';
          },
        },
        {
          title: texts['005'],
          key: 'user.email',
          minWidth: 160,
        },
        {
          title: texts['006'],
          key: 'startTime',
          minWidth: 160,
          render: (row, value) => (value ? new Date(value).toLocaleString() : systemTexts['NULL']),
        },
        {
          title: texts['008'],
          key: 'leftTimes',
        },
        {
          title: texts['009'],
          key: 'fraud',
          render: (row: UserExam, value: boolean) => {
            return value ? systemTexts['TRUE'] : systemTexts['FALSE'];
          },
        },
        {
          title: systemTexts['OPERATIONS'],
          key: 'user',
          render: (row: UserExam, value: User) => {
            if (!exam) {
              return null;
            }
            const { fraud } = row;
            return (
              <Button
                size="small"
                color="primary"
                variant="text"
                startIcon={fraud ? <AccountRemoveOutlineIcon /> : <AccountAlertOutlineIcon />}
                classes={{ root: clsx(fraud ? classes.cancelReportFraudButton : classes.reportFraudButton) }}
                onClick={() => handleChangeFraudStatus(exam.id, value.email, !fraud)}
              >{fraud ? texts['013'] : texts['012']}</Button>
            );
          },
        },
      ]);
    }
  }, [texts, systemTexts, exam]);

  return (
    <div className="app-page app-page-home__exams__invigilate">
      <div className="app-grid-container">
        <Box className={classes.controlButtonsWrapper}>
          <Box>
            <Button
              startIcon={<ArrowBackIcon />}
              variant="outlined"
              onClick={() => history.go(-1)}
            >{texts['001']}</Button>
            <Button
              startIcon={<VideoOutlineIcon />}
              variant="text"
              color="primary"
              onClick={() => handleJumpMediaPage(exam.id, 'camera')}
            >{texts['010']}</Button>
            <Button
              startIcon={<MonitorIcon />}
              variant="text"
              color="primary"
              onClick={() => handleJumpMediaPage(exam.id, 'desktop')}
            >{texts['011']}</Button>
          </Box>
          <Button
            startIcon={queryExamParticipantsLoading ? null : <RefreshOutlinedIcon />}
            disabled={queryExamParticipantsLoading}
            variant="text"
            color="primary"
            onClick={() => refreshQueryExamParticipants()}
          >{!queryExamParticipantsLoading ? texts['002'] : texts['007']}</Button>
        </Box>
        <Box className={classes.contentWrapper}>
          {
            !(examLoading || queryExamParticipantsLoading)
              ? checkInvigilatePermission(exam)
                ? exam
                  ? (
                    <>
                      <Typography
                        variant="h6"
                        gutterBottom={true}
                        classes={{ root: 'app-icon-typography' }}
                      >
                        <FileClockIcon color="primary" />
                        {exam.title}
                      </Typography>
                      <AppTable
                        schema={schema}
                        data={examParticipants}
                        wrapperClassName={classes.contentTableWrapper}
                        selectable={false}
                        loading={queryExamParticipantsLoading}
                        TablePaginationProps={{
                          count: totalExamParticipants,
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
                      />
                    </>
                  )
                  : <AppIndicator type="empty" />
                : <AppIndicator type="not_ready" />
              : <AppIndicator type="loading" />
          }
        </Box>
      </div>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(InvigilatePage);
