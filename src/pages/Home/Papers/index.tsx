import { deletePapers, queryPapers } from './service';
import { AppState } from '../../../models/app';
import AppDialogManager from '../../../components/AppDialog/Manager';
import { Dispatch, PaperResponseData, User } from '../../../interfaces';
import { connect } from '../../../patches/dva';
import { ConnectState } from '../../../models';
import AppSearchBar from '../../../components/AppSearchBar';
import { pushSearch, useLocationQuery } from '../../../utils/history';
import { useDebouncedValue } from '../../../utils/hooks';
import AppPaperEditor from '../../../components/AppPaperEditor';
import { usePaginationRequest, useRequest } from '../../../utils/request';
import AppTable, { TableSchema } from '../../../components/AppTable';
import { usePageTexts, useTexts } from '../../../utils/texts';
import Dropdown from '../../../components/Dropdown';
import { getUserProfile } from '../service';
import React, { useEffect, useState } from 'react';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import { useHistory } from 'react-router';
import _ from 'lodash';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import DeleteIcon from '@material-ui/icons/Delete';
import FileDocumentEditIcon from 'mdi-material-ui/FileDocumentEdit';

export interface PapersPageProps extends AppState, Dispatch {}

const useStyles = makeStyles((theme) => {
  return {
    tableWrapper: {
      marginTop: theme.spacing(4),
    },
  };
});

const checkPaperRoles = (papers: PaperResponseData[], user: User) => {
  for (const paper of papers) {
    if (_.get(paper, 'creator.email') !== _.get(user, 'email')) {
      return false;
    }
  }
  return true;
};

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
  const [currentEditorMode, setCurrentEditorMode] = useState<'create' | 'edit'>('create');

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
  const [profile] = useRequest<User>(getUserProfile, undefined);

  const [selectedPapers, setSelectedPapers] = useState<PaperResponseData[]>([]);

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
            setCurrentEditorMode('create');
            setCreatePaperOpen(true);
          }}
        />
        <AppTable
          schema={schema}
          data={paperItems}
          loading={queryPapersLoading}
          wrapperClassName={classes.tableWrapper}
          toolbarButtons={[
            {
              Icon: FileDocumentEditIcon,
              title: systemTexts['EDIT'],
              show: selectedPapers.length === 1,
              IconButtonProps: {
                onClick: () => {
                  setCurrentEditorMode('edit');
                  setCreatePaperOpen(true);
                },
              },
            },
            {
              Icon: DeleteIcon,
              title: systemTexts['DELETE'],
              show: checkPaperRoles(selectedPapers, profile),
              IconButtonProps: {
                onClick: () => {
                  AppDialogManager.confirm(`${texts['008']}: ${selectedPapers.map((exam) => exam.title).join(', ')}`, {
                    disableBackdropClick: true,
                    onConfirm: () => {
                      deletePapers(selectedPapers.map((paper) => paper.id)).finally(() => {
                        refreshQueryPapers();
                      });
                    },
                  });
                },
              },
            },
          ]}
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
          onSelectionChange={(items: PaperResponseData[]) => setSelectedPapers(items)}
        />
      </div>
      <AppPaperEditor
        open={createPaperOpen}
        mode={currentEditorMode}
        paper={_.first(selectedPapers)}
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
