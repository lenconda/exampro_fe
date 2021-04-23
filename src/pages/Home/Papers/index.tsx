import { AppState } from '../../../models/app';
import { Dispatch } from '../../../interfaces';
import { connect } from '../../../patches/dva';
import { ConnectState } from '../../../models';
import AppSearchBar from '../../../components/AppSearchBar';
import { pushSearch, useLocationQuery } from '../../../utils/history';
import { useDebouncedValue } from '../../../utils/hooks';
import AppPaperEditor from '../../../components/AppPaperEditor';
import React, { useEffect, useState } from 'react';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import { useHistory } from 'react-router';

export interface PapersPageProps extends AppState, Dispatch {}

const PapersPage: React.FC<PapersPageProps> = ({
  dispatch,
}) => {
  const history = useHistory();
  const search = useLocationQuery('search') as string;
  const [inputSearch, setInputSearch] = useState<string>(undefined);
  const debouncedSearch = useDebouncedValue<string>(inputSearch);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [createPaperOpen, setCreatePaperOpen] = useState<boolean>(false);

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
        <AppSearchBar
          search={search}
          CreateIcon={NoteAddIcon}
          onSearchChange={(search) => setInputSearch(search)}
          onCreateClick={() => {
            setMode('create');
            setCreatePaperOpen(true);
          }}
        />
      </div>
      <AppPaperEditor open={createPaperOpen} mode="create" />
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(PapersPage);
