import { ConnectState } from '../../../models';
import { AppState } from '../../../models/app';
import { connect } from '../../../patches/dva';
import { useTexts } from '../../../utils/texts';
import { Dispatch } from '../../../interfaces';
import AppQuestionEditor, { AppQuestionMetaData } from '../../../components/AppQuestionEditor';
import { getQuestionWithAnswers } from '../../../components/AppQuestionEditor/service';
import AppQuestionItem from '../../../components/AppQuestionItem';
import React, { useEffect, useState } from 'react';

export interface QuestionPageProps extends AppState, ConnectState, Dispatch {}

const QuestionsPage: React.FC<QuestionPageProps> = ({
  dispatch,
}) => {
  const editorTexts = useTexts(dispatch, 'editor');
  const [createQuestionOpen, setCreateQuestionOpen] = useState<boolean>(false);
  const [editQuestionOpen, setEditQuestionOpen] = useState<boolean>(false);
  const [questionMetaData, setQuestionMetaData] = useState<AppQuestionMetaData>(null);
  const [test, setTest] = useState<AppQuestionMetaData>(null);
  const [test21, setTest21] = useState<AppQuestionMetaData>(null);
  const [test22, setTest22] = useState<AppQuestionMetaData>(null);

  useEffect(() => {
    getQuestionWithAnswers(15).then((data) => {
      setTest(data);
    });
    getQuestionWithAnswers(21).then((data) => setTest21(data));
    getQuestionWithAnswers(22).then((data) => setTest22(data));
  }, []);

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
        <AppQuestionItem
          answerable={true}
          question={test}
          questionNumber={1}
          // canCollapse={true}
        />
        <AppQuestionItem
          answerable={true}
          question={test21}
          questionNumber={1}
        />
        <AppQuestionItem
          answerable={true}
          question={test22}
          questionNumber={1}
        />
      </div>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(QuestionsPage);
