import { Dispatch } from '../../../../interfaces';
import { AppState } from '../../../../models/app';
import { connect } from '../../../../patches/dva';
import { ConnectState } from '../../../../models';
import React, { useEffect } from 'react';
import { useParams } from 'react-router';

export interface ReviewListPageProps extends Dispatch, AppState {}

const ReviewListPage: React.FC<ReviewListPageProps> = ({
  dispatch,
}) => {
  const params = useParams();

  useEffect(() => {
    console.log(params);
  }, [params]);

  return (
    <div className="app-page app-page-home__exams__review-list">
      <div className="app-grid-container">
        exam review list
      </div>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(ReviewListPage);
