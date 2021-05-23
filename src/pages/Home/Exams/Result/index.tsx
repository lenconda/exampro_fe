import { getExamResults } from './service';
import { Dispatch, ExamResponseData, ExamResultListItem, User } from '../../../../interfaces';
import { AppState } from '../../../../models/app';
import { connect } from '../../../../patches/dva';
import { ConnectState } from '../../../../models';
import { usePageTexts, useTexts } from '../../../../utils/texts';
import { checkReviewResultPermission } from '../../../../utils/exam';
import AppIndicator from '../../../../components/AppIndicator';
import AppTable, { TableSchema } from '../../../../components/AppTable';
import { getExamInfo } from '../../../../components/AppExamContainer/service';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ExportVariantIcon from 'mdi-material-ui/ExportVariant';
import FileClockIcon from 'mdi-material-ui/FileClock';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { makeStyles } from '@material-ui/core';
import _ from 'lodash';

export interface ResultPageProps extends Dispatch, AppState {}

const useStyles = makeStyles((theme) => {
  return {
    controlButtonsWrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
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
  };
});

const ResultPage: React.FC<ResultPageProps> = ({
  dispatch,
}) => {
  const history = useHistory();
  const classes = useStyles();
  const params = useParams() as Record<string, string>;
  const texts = usePageTexts(dispatch, '/home/exams/result');
  const systemTexts = useTexts(dispatch, 'system');
  const [examLoading, setExamLoading] = useState<boolean>(true);
  const [exam, setExam] = useState<ExamResponseData>(undefined);
  const [resultLoading, setResultLoading] = useState<boolean>(true);
  const [resultItems, setResultItems] = useState<ExamResultListItem[]>([]);
  const [schema, setSchema] = useState<TableSchema[]>([]);

  const handleGetExamResults = (id: number) => {
    if (!_.isNumber(id)) { return }
    setResultLoading(true);
    getExamResults(id).then((items) => {
      setResultItems(items);
    }).finally(() => {
      setResultLoading(false);
    });
  };

  const handleGetExamInfo = (id: number) => {
    setExamLoading(true);
    getExamInfo(id, 'review').then((info) => {
      setExam(info);
    }).finally(() => {
      setExamLoading(false);
    });
  };

  useEffect(() => {
    const currentExamId = _.get(exam, 'id');
    if (_.isNumber(currentExamId)) {
      handleGetExamResults(currentExamId);
    } else {
      setResultLoading(false);
    }
  }, [exam]);

  useEffect(() => {
    const { id } = params;
    const currentExamId = parseInt(id, 10);
    if (id && _.isNumber(currentExamId)) {
      handleGetExamInfo(currentExamId);
    } else {
      setExamLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!_.isEmpty(systemTexts) && !_.isEmpty(texts)) {
      setSchema([
        {
          title: texts['004'],
          key: 'user.avatar',
          render: (row, value) => {
            return <Avatar src={value} />;
          },
        },
        {
          title: texts['005'],
          key: 'user.name',
          render: (row: ExamResultListItem, value) => {
            return value || (_.get(row, 'user.email') as string || '').split('@')[0] || '-';
          },
        },
        {
          title: texts['006'],
          key: 'user.email',
          minWidth: 160,
        },
        {
          title: texts['007'],
          key: 'createdAt',
          minWidth: 160,
          render: (row, value) => (value ? new Date(value).toLocaleString() : systemTexts['NULL']),
        },
        {
          title: texts['008'],
          key: 'score',
        },
        {
          title: systemTexts['OPERATIONS'],
          key: 'user',
          render: (row: ExamResultListItem, value: User) => {
            const { email } = value;
            const url = `/exam/${_.get(exam, 'id')}?action=result&participant_email=${email}`;
            return (
              <Link
                color="secondary"
                href={url}
                target="_blank"
              >{texts['009']}</Link>
            );
          },
        },
      ]);
    }
  }, [texts, systemTexts, exam]);

  return (
    <div className="app-page app-page-home__exams__result">
      <div className="app-grid-container">
        <Box className={classes.controlButtonsWrapper}>
          <Button
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            onClick={() => history.go(-1)}
          >{texts['001']}</Button>
          <Button
            startIcon={<ExportVariantIcon />}
            variant="text"
            color="primary"
            onClick={() => {
              // TODO:
            }}
          >{systemTexts['EXPORT']}</Button>
        </Box>
        <Box className={classes.contentWrapper}>
          {
            !(examLoading || resultLoading)
              ? checkReviewResultPermission(exam)
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
                        data={resultItems}
                        pagination={false}
                        wrapperClassName={classes.contentTableWrapper}
                        selectable={false}
                        loading={resultLoading || examLoading}
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

export default connect(({ app }: ConnectState) => app)(ResultPage);
