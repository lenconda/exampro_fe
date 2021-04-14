import { ConnectState } from '../../../models';
import { AppState } from '../../../models/app';
import { connect } from '../../../patches/dva';
import { usePageTexts, useTexts } from '../../../utils/texts';
import { Dispatch } from '../../../interfaces';
import AppQuestionEditor, { AppQuestionMetaData } from '../../../components/AppQuestionEditor';
import { getQuestionWithAnswers } from '../../../components/AppQuestionEditor/service';
import AppQuestionItem from '../../../components/AppQuestionItem';
import { useDebouncedValue } from '../../../utils/hooks';
import { pushSearch, useLocationQuery } from '../../../utils/history';
import InputBase from '@material-ui/core/InputBase';
import Paper from '@material-ui/core/Paper';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';

export interface QuestionPageProps extends AppState, ConnectState, Dispatch {}

const QuestionsPage: React.FC<QuestionPageProps> = ({
  dispatch,
}) => {
  const editorTexts = useTexts(dispatch, 'editor');
  const history = useHistory();
  const pageTexts = usePageTexts(dispatch, '/home/questions');
  const [inputSearch, setInputSearch] = useState<string>(undefined);
  const debouncedSearch = useDebouncedValue(inputSearch);
  const search = useLocationQuery('search');

  useEffect(() => {
    if (debouncedSearch !== undefined) {
      history.push(pushSearch(history, {
        search: debouncedSearch,
      }));
    }
  }, [debouncedSearch]);

  return (
    <div className="app-page app-page-home__questions">
      <div className="app-grid-container">
        <div className="app-page-interact-wrapper">
          <Paper
            classes={{ root: 'app-search-wrapper' }}
          >
            <InputBase
              classes={{
                root: 'app-search-wrapper__input__root',
                input: 'app-search-wrapper__input__input',
              }}
              placeholder={pageTexts['001']}
              onChange={(event) => setInputSearch(event.target.value)}
            />
          </Paper>
        </div>
      </div>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(QuestionsPage);
