import { queryExamParticipantsWithUserExamRelation } from './service';
import { Dispatch, ExamResponseData, UserExam } from '../../../../interfaces';
import { AppState } from '../../../../models/app';
import { connect } from '../../../../patches/dva';
import { ConnectState } from '../../../../models';
import { usePageTexts } from '../../../../utils/texts';
import { getExamInfo } from '../../../../components/AppExamContainer/service';
import { checkReviewPermission } from '../../../../utils/exam';
import AppIndicator from '../../../../components/AppIndicator';
import { usePaginationRequest } from '../../../../utils/request';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import RefreshOutlinedIcon from '@material-ui/icons/RefreshOutlined';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { makeStyles, Typography } from '@material-ui/core';
import _ from 'lodash';

export interface ReviewListPageProps extends Dispatch, AppState {}

const useStyles = makeStyles((theme) => {
  return {
    controlButtonsWrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
  };
});

const ReviewListPage: React.FC<ReviewListPageProps> = ({
  dispatch,
}) => {
  const history = useHistory();
  const classes = useStyles();
  const params = useParams() as Record<string, string>;
  const texts = usePageTexts(dispatch, '/home/exams/review_list');
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

  const fetchExamInfo = (id: number) => {
    setExamLoading(true);
    getExamInfo(id, 'review').then((info) => {
      setExam(info);
    }).finally(() => setExamLoading(false));
  };

  useEffect(() => {
    const { id } = params;
    const currentExamId = parseInt(id, 10);
    if (id && _.isNumber(currentExamId)) {
      fetchExamInfo(currentExamId);
    } else {
      setExamLoading(false);
    }
  }, []);

  return (
    <div className="app-page app-page-home__exams__review-list">
      <div className="app-grid-container">
        <Box className={classes.controlButtonsWrapper}>
          <Button
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            onClick={() => history.go(-1)}
          >{texts['001']}</Button>
          <Button
            startIcon={<RefreshOutlinedIcon />}
            variant="text"
            color="primary"
          >{texts['002']}</Button>
        </Box>
        <Box>
          {
            !(examLoading || queryExamParticipantsLoading)
              ? checkReviewPermission(exam)
                ? (
                  <>
                    <Typography></Typography>
                  </>
                )
                : exam
                  ? <AppIndicator type="not_ready" />
                  : <AppIndicator type="empty" />
              : <AppIndicator type="loading" />
          }
        </Box>
      </div>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(ReviewListPage);
