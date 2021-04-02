import { ConnectState } from '../../../models';
import { AppState } from '../../../models/app';
import { connect } from '../../../patches/dva';
import QuestionEditor from '../../../components/QuestionEditor';
import Paper from '@material-ui/core/Paper';
import React from 'react';

export interface QuestionPageProps extends AppState, ConnectState {}

const QuestionsPage: React.FC<QuestionPageProps> = (props) => {
  return (
    <div className="app-page app-page-home__questions">
      <div className="app-grid-container">
        <Paper>
          <QuestionEditor />
        </Paper>
      </div>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(QuestionsPage);
