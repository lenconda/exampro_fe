import { Dispatch, ExamResponseData, User } from '../../../../../interfaces';
import { AppState } from '../../../../../models/app';
import { connect } from '../../../../../patches/dva';
import { ConnectState } from '../../../../../models';
import { usePageTexts, useTexts } from '../../../../../utils/texts';
import { getExamInfo } from '../../../../../components/AppExamContainer/service';
import { checkInvigilatePermission } from '../../../../../utils/exam';
import AppIndicator from '../../../../../components/AppIndicator';
import { useLocationQuery } from '../../../../../utils/history';
import { getUserProfile } from '../../../../../service';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { makeStyles } from '@material-ui/core';
import _ from 'lodash';
import AppRecorder from '../../../../../components/AppRecorder';

export interface ReviewListPageProps extends Dispatch, AppState {}

const useStyles = makeStyles((theme) => {
  return {
    video: {
      width: '100%',
    },
  };
});

const RecordingPage: React.FC<ReviewListPageProps> = ({
  dispatch,
}) => {
  const history = useHistory();
  const classes = useStyles();
  const params = useParams() as Record<string, string>;
  const texts = usePageTexts(dispatch, '/home/exams/invigilate/recording');
  const [examLoading, setExamLoading] = useState<boolean>(true);
  const [exam, setExam] = useState<ExamResponseData>(undefined);
  const [participant, setParticipant] = useState<User>(undefined);

  const handleGetExamInfo = (id: number) => {
    setExamLoading(true);
    getExamInfo(id, 'invigilate').then((info) => {
      setExam(info);
    }).finally(() => setExamLoading(false));
  };

  useEffect(() => {
    const { id } = params;
    const currentExamId = parseInt(id, 10);
    if (id && _.isNumber(currentExamId)) {
      handleGetExamInfo(currentExamId);
    } else {
      setExamLoading(false);
    }
  }, [params]);

  return (
    <div className="app-page app-page-home__exams__invigilate__recording">
      <div className="app-grid-container">
        {
          examLoading
            ? <AppIndicator type="loading" />
            : !exam
              ? <AppIndicator type="empty" />
              : !checkInvigilatePermission(exam)
                ? <AppIndicator type="not_ready" />
                : (
                  <AppRecorder room={exam.id.toString()} />
                )
        }
      </div>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(RecordingPage);
