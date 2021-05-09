import { Dispatch } from '../../../../interfaces';
import { AppState } from '../../../../models/app';
import { connect } from '../../../../patches/dva';
import { ConnectState } from '../../../../models';
import { usePageTexts } from '../../../../utils/texts';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import RefreshOutlinedIcon from '@material-ui/icons/RefreshOutlined';
import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { makeStyles } from '@material-ui/core';

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
  const classes = useStyles();
  const params = useParams();
  const texts = usePageTexts(dispatch, '/home/exams/review_list');

  useEffect(() => {
    console.log(params);
  }, [params]);

  return (
    <div className="app-page app-page-home__exams__review-list">
      <div className="app-grid-container">
        <Box className={classes.controlButtonsWrapper}>
          <Button
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >{texts['001']}</Button>
          <Button
            startIcon={<RefreshOutlinedIcon />}
            variant="text"
            color="primary"
          >{texts['002']}</Button>
        </Box>
      </div>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(ReviewListPage);
