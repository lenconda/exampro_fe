import { ConnectState } from '../../../models';
import { AppState } from '../../../models/app';
import { connect } from '../../../patches/dva';
import { useTexts } from '../../../utils/texts';
import { Dispatch } from '../../../interfaces';
import AppQuestionEditor, { AppQuestionMetaData } from '../../../components/AppQuestionEditor';
import { getQuestionWithAnswers } from '../../../components/AppQuestionEditor/service';
import React, { useState } from 'react';

export interface QuestionPageProps extends AppState, ConnectState, Dispatch {}

const QuestionsPage: React.FC<QuestionPageProps> = ({
  dispatch,
}) => {
  const editorTexts = useTexts(dispatch, 'editor');
  const [createQuestionOpen, setCreateQuestionOpen] = useState<boolean>(false);
  const [editQuestionOpen, setEditQuestionOpen] = useState<boolean>(false);
  const [questionMetaData, setQuestionMetaData] = useState<AppQuestionMetaData>(null);

  return (
    <div className="app-page app-page-home__questions">
      <div className="app-grid-container">
        <button onClick={() => setCreateQuestionOpen(true)}>Create Question</button>
        <button
          onClick={() => {
            getQuestionWithAnswers(15).then((data) => {
              setQuestionMetaData(data);
              setEditQuestionOpen(true);
            });
          }}
        >Edit Question 13</button>
        <AppQuestionEditor
          open={createQuestionOpen}
          onClose={() => setCreateQuestionOpen(false)}
          onSubmitQuestion={(data) => {
            setCreateQuestionOpen(false);
          }}
        />
        <AppQuestionEditor
          mode="edit"
          open={editQuestionOpen}
          question={questionMetaData}
          onClose={() => setEditQuestionOpen(false)}
          onSubmitQuestion={(data) => {
            setEditQuestionOpen(false);
          }}
        />
      </div>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(QuestionsPage);
