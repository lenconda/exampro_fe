import { ConnectState } from '../../../models';
import { AppState } from '../../../models/app';
import { connect } from '../../../patches/dva';
import Editor from '../../../components/Editor';
import { useTexts } from '../../../utils/texts';
import { Dispatch } from '../../../interfaces';
import Paper from '@material-ui/core/Paper';
import React from 'react';

export interface QuestionPageProps extends AppState, ConnectState, Dispatch {}

const QuestionsPage: React.FC<QuestionPageProps> = ({
  dispatch,
}) => {
  const editorTexts = useTexts(dispatch, 'editor');

  return (
    <div className="app-page app-page-home__questions">
      <div className="app-grid-container">
        <Paper>
          <Editor texts={editorTexts} />
        </Paper>
      </div>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(QuestionsPage);
