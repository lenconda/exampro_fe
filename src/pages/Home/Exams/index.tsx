import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from '../../../interfaces';
import { ConnectState } from '../../../models';
import { AppState } from '../../../models/app';
import './index.less';

export interface ExamPageProps extends Dispatch, AppState {}

const ExamsPage: React.FC<ExamPageProps> = ({
  dispatch,
}) => {
  return (
    <></>
  );
};

export default connect(({ app }: ConnectState) => app)(ExamsPage);
