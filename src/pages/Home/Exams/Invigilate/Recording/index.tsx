import { Dispatch, ExamResponseData, User } from '../../../../../interfaces';
import { AppState } from '../../../../../models/app';
import { connect } from '../../../../../patches/dva';
import { ConnectState } from '../../../../../models';
import { usePageTexts, useTexts } from '../../../../../utils/texts';
import { getExamInfo } from '../../../../../components/AppExamContainer/service';
import { checkInvigilatePermission } from '../../../../../utils/exam';
import AppIndicator from '../../../../../components/AppIndicator';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { makeStyles } from '@material-ui/core';
import _ from 'lodash';

export interface ReviewListPageProps extends Dispatch, AppState {}

const useStyles = makeStyles((theme) => {
  return {};
});

const RecordingPage: React.FC<ReviewListPageProps> = ({
  dispatch,
}) => {
  const history = useHistory();
  const classes = useStyles();
  const params = useParams() as Record<string, string>;
  const texts = usePageTexts(dispatch, '/home/exams/invigilate/recording');
  const systemTexts = useTexts(dispatch, 'system');
  const [checking, setChecking] = useState<boolean>(true);
  const [exam, setExam] = useState<ExamResponseData>(undefined);
  const [participant, setParticipant] = useState<User>(undefined);

  const fetchExamInfo = (id: number) => {
    getExamInfo(id, 'invigilate').then((info) => {
      setExam(info);
    });
  };

  useEffect(() => {
    const { id } = params;
    const currentExamId = parseInt(id, 10);
    if (id && _.isNumber(currentExamId)) {
      fetchExamInfo(currentExamId);
    } else {
      setChecking(false);
    }
  }, []);

  return (
    <div className="app-page app-page-home__exams__invigilate__recording">
      <div className="app-grid-container">

      </div>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(RecordingPage);
