import { queryPapers } from './service';
import { AppState } from '../../../models/app';
import { Dispatch, PaperResponseData } from '../../../interfaces';
import { connect } from '../../../patches/dva';
import { ConnectState } from '../../../models';
import AppSearchBar from '../../../components/AppSearchBar';
import { pushSearch, useLocationQuery } from '../../../utils/history';
import { useDebouncedValue } from '../../../utils/hooks';
import AppPaperEditor from '../../../components/AppPaperEditor';
import { usePaginationRequest } from '../../../utils/request';
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
  const [role, setRole] = useState<'resource/paper/owner' | 'resource/paper/maintainer'>('resource/paper/owner');
  const [createPaperOpen, setCreatePaperOpen] = useState<boolean>(false);

  const [
    paperItems = [],
    totalPapers = 0,
    queryPapersLoading,
    page,
    size,
    lastCursor,
    error,
    refreshQueryPapers,
  ] = usePaginationRequest<PaperResponseData>(queryPapers, { roles: role });

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
            setCreatePaperOpen(true);
          }}
        />
      </div>
      <AppPaperEditor
        open={createPaperOpen}
        mode="create"
        onClose={() => setCreatePaperOpen(false)}
        onSubmitPaper={() => setCreatePaperOpen(false)}
      />
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(PapersPage);
