import { queryPapers } from './service';
import { AppState } from '../../../models/app';
import { Dispatch, PaperResponseData, User } from '../../../interfaces';
import { connect } from '../../../patches/dva';
import { ConnectState } from '../../../models';
import AppSearchBar from '../../../components/AppSearchBar';
import { pushSearch, useLocationQuery } from '../../../utils/history';
import { useDebouncedValue } from '../../../utils/hooks';
import AppPaperEditor from '../../../components/AppPaperEditor';
import { usePaginationRequest } from '../../../utils/request';
import AppTable, { TableSchema } from '../../../components/AppTable';
import { usePageTexts, useTexts } from '../../../utils/texts';
import Dropdown from '../../../components/Dropdown';
import React, { useEffect, useState } from 'react';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import { useHistory } from 'react-router';
import _ from 'lodash';
import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

export interface PapersPageProps extends AppState, Dispatch {}

const useStyles = makeStyles((theme) => {
  return {
    tableWrapper: {
      marginTop: theme.spacing(4),
    },
  };
});

const PapersPage: React.FC<PapersPageProps> = ({
  dispatch,
}) => {
  const classes = useStyles();
  const history = useHistory();
  const search = useLocationQuery('search') as string;
  const texts = usePageTexts(dispatch, '/home/papers');
  const systemTexts = useTexts(dispatch, 'system');
  const [inputSearch, setInputSearch] = useState<string>(undefined);
  const debouncedSearch = useDebouncedValue<string>(inputSearch);
  const [createPaperOpen, setCreatePaperOpen] = useState<boolean>(false);
  const [schema, setSchema] = useState<TableSchema[]>([]);

  const roles = useLocationQuery('roles') as string;

  const [
    paperItems = [],
    totalPapers = 0,
    queryPapersLoading,
    page,
    size,
    lastCursor,
    error,
    refreshQueryPapers,
  ] = usePaginationRequest<PaperResponseData>(queryPapers, { roles });

  useEffect(() => {
    if (debouncedSearch !== undefined) {
      history.push(pushSearch(history, {
        search: debouncedSearch,
      }));
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (!roles) {
      history.push(pushSearch(history, {
        roles: 'resource/paper/owner,resource/paper/maintainer',
      }));
    }
  }, [roles]);

  useEffect(() => {
    if (!_.isEmpty(systemTexts) && !_.isEmpty(texts)) {
      setSchema([
        {
          title: texts['004'],
          key: 'title',
        },
        {
          title: texts['005'],
          key: 'creator',
          render: (row, value: User) => {
            const { email, name } = value;
            return `${name || email.split('@')[0]} (${email})`;
          },
        },
        {
          title: texts['006'],
          key: 'createdAt',
          minWidth: 160,
          render: (row, value) => new Date(value).toLocaleString(),
        },
        {
          title: texts['007'],
          key: 'updatedAt',
          minWidth: 160,
          render: (row, value) => (value ? new Date(value).toLocaleString() : systemTexts['NULL']),
        },
      ]);
    }
  }, [texts, systemTexts]);

  return (
    <div className="app-page app-page-home__questions">
      <div className="app-grid-container">
        <AppSearchBar
          search={search}
          leftComponent={
            <Dropdown
              trigger={
                <Button
                  fullWidth={true}
                  endIcon={<ArrowDropDownIcon />}
                >{texts[roles]}</Button>
              }
              closeOnClickBody={true}
            >
              {
                [
                  'resource/paper/owner,resource/paper/maintainer',
                  'resource/paper/owner',
                  'resource/paper/maintainer',
                ].map((role, index) => {
                  return (
                    <div
                      key={index}
                      onClick={() => {
                        history.push(pushSearch(history, {
                          roles: role,
                        }));
                      }}
                    >
                      <MenuItem>{texts[role]}</MenuItem>
                    </div>
                  );
                })
              }
            </Dropdown>
          }
          CreateIcon={NoteAddIcon}
          onSearchChange={(search) => setInputSearch(search)}
          onCreateClick={() => {
            setCreatePaperOpen(true);
          }}
        />
        <AppTable
          schema={schema}
          data={paperItems}
          loading={queryPapersLoading}
          wrapperClassName={classes.tableWrapper}
          TablePaginationProps={{
            count: totalPapers,
            page: page - 1,
            rowsPerPage: size,
            onChangePage: (event, newPageNumber) => {
              history.push({
                search: pushSearch(history, {
                  page: newPageNumber + 1,
                }),
              });
            },
            onChangeRowsPerPage: (event) => {
              history.push({
                search: pushSearch(history, {
                  size: event.target.value,
                  page: 1,
                }),
              });
            },
          }}
        />
      </div>
      <AppPaperEditor
        open={createPaperOpen}
        mode="create"
        onClose={() => setCreatePaperOpen(false)}
        onSubmitPaper={() => {
          setCreatePaperOpen(false);
          refreshQueryPapers();
        }}
      />
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(PapersPage);
