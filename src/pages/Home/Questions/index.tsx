import { ConnectState } from '../../../models';
import { AppState } from '../../../models/app';
import { connect } from '../../../patches/dva';
import { useTexts } from '../../../utils/texts';
import { Dispatch } from '../../../interfaces';
import AppQuestionEditor from '../../../components/AppQuestionEditor';
import React, { useState } from 'react';

export interface QuestionPageProps extends AppState, ConnectState, Dispatch {}

const QuestionsPage: React.FC<QuestionPageProps> = ({
  dispatch,
}) => {
  const editorTexts = useTexts(dispatch, 'editor');
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="app-page app-page-home__questions">
      <div className="app-grid-container">
        <button onClick={() => setOpen(true)}>open question</button>
        <AppQuestionEditor
          open={open}
          onClose={() => setOpen(false)}
        />
      </div>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(QuestionsPage);
