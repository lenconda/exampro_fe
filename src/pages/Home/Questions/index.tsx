import { deleteQuestions, queryAllPapers, queryQuestions } from './service';
import { ConnectState } from '../../../models';
import { AppState } from '../../../models/app';
import { connect } from '../../../patches/dva';
import { usePageTexts, useTexts } from '../../../utils/texts';
import { Dispatch, PaperResponseData, QuestionCategory, QuestionResponseData } from '../../../interfaces';
import AppQuestionEditor from '../../../components/AppQuestionEditor';
import { getAllCategoriesWithoutPagination } from '../../../components/AppQuestionEditor/service';
import AppQuestionItem from '../../../components/AppQuestionItem';
import { useDebouncedValue } from '../../../utils/hooks';
import { pushSearch, useLocationQuery } from '../../../utils/history';
import { usePaginationRequest, useRequest } from '../../../utils/request';
import { pipeQuestionResponseToMetadata } from '../../../utils/pipes';
import AppDialogManager from '../../../components/AppDialog/Manager';
import AppSearchBar from '../../../components/AppSearchBar';
import AppIndicator from '../../../components/AppIndicator';
import AppPaperEditor from '../../../components/AppPaperEditor';
import Badge from '@material-ui/core/Badge';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import TablePagination from '@material-ui/core/TablePagination';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import AddCommentIcon from '@material-ui/icons/AddComment';
import FilterMenuOutlineIcon from 'mdi-material-ui/FilterMenuOutline';
import PlaylistPlusIcon from 'mdi-material-ui/PlaylistPlus';
import IconButton from '@material-ui/core/IconButton';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { lighten, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import './index.less';

export interface QuestionPageProps extends AppState, ConnectState, Dispatch {}

const useStyles = makeStyles((theme) => {
  return {
    buttonsWrapper: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(2),
      '& > button': {
        marginRight: theme.spacing(2),
      },
    },
    itemsWrapper: {
      padding: theme.spacing(2),
      overflowY: 'scroll',
    },
    item: {
      marginBottom: theme.spacing(2),
    },
    filterMenu: {
      width: 240,
    },
    filterMenuTitle: {
      paddingRight: theme.spacing(2),
      paddingLeft: theme.spacing(2),
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    categoriesWrapper: {
      maxHeight: 360,
      overflowY: 'scroll',
      paddingTop: theme.spacing(1),
    },
    controlsWrapper: {
      padding: theme.spacing(2),
      paddingBottom: 0,
    },
    categoriesMenuEmptyWrapper: {
      height: 240,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectedCategoryItem: {
      backgroundColor: lighten(theme.palette.primary.main, 0.85),
      '&:hover': {
        backgroundColor: lighten(theme.palette.primary.main, 0.70),
      },
    },
    deleteButton: {
      color: theme.palette.error.main,
    },
    addQuestionMenu: {
      width: 320,
    },
    addQuestionMenuSearchWrapper: {
      padding: theme.spacing(2),
    },
    addQuestionMenuItemsWrapper: {
      maxHeight: 360,
      overflowY: 'scroll',
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
    },
  };
});

const QuestionsPage: React.FC<QuestionPageProps> = ({
  dispatch,
}) => {
  const classes = useStyles();
  const history = useHistory();
  const tableTexts = useTexts(dispatch, 'table');
  const systemTexts = useTexts(dispatch, 'system');
  const pageTexts = usePageTexts(dispatch, '/home/questions');
  const [inputSearch, setInputSearch] = useState<string>(undefined);
  const debouncedSearch = useDebouncedValue(inputSearch);
  const search = useLocationQuery('search') as string;
  const selectedCategoriesString = (useLocationQuery('categories') || '') as string;
  const [
    questionItems = [],
    totalQuestions = 0,
    queryQuestionsLoading,
    page,
    size,
    lastCursor,
    error,
    refreshQueryQuestions,
  ] = usePaginationRequest<QuestionResponseData>(queryQuestions, { categories: selectedCategoriesString });
  const [categories = [], getCategoriesLoading] = useRequest<QuestionCategory[]>(getAllCategoriesWithoutPagination, []);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<HTMLElement>(null);
  const [createQuestionOpen, setCreateQuestionOpen] = useState<boolean>(false);
  const [selectedQuestions, setSelectedQuestions] = useState<QuestionResponseData[]>([]);
  const [addQuestionMenuAnchor, setAddQuestionMenuAnchor] = useState<HTMLElement>(null);
  const [paperSearchValue, setPaperSearchValue] = useState<string>('');
  const debouncedPaperSearchValue = useDebouncedValue(paperSearchValue);
  const [papersLoading, setPapersLoading] = useState<boolean>(false);
  const [papers, setPapers] = useState<PaperResponseData[]>([]);
  const [paperEditorOpen, setPaperEditorOpen] = useState<boolean>(false);
  const [paperEditorMode, setPaperEditorMode] = useState<'create' | 'edit'>('create');
  const [currentSelectedPaper, setCurrentSelectedPaper] = useState<PaperResponseData>(undefined);

  const fetchQueriedPapers = (search: string) => {
    setPapersLoading(true);
    queryAllPapers(search).then((papers) => setPapers(papers)).finally(() => setPapersLoading(false));
  };

  const clearSelection = () => {
    setPaperEditorOpen(false);
    setCurrentSelectedPaper(undefined);
    setSelectedQuestions([]);
    setAddQuestionMenuAnchor(null);
  };

  useEffect(() => {
    fetchQueriedPapers(debouncedPaperSearchValue);
  }, [debouncedPaperSearchValue]);

  useEffect(() => {
    if (debouncedSearch !== undefined) {
      history.push(pushSearch(history, {
        search: debouncedSearch,
      }));
    }
  }, [debouncedSearch]);

  return (
    <div className="app-page app-page-home__questions">
      <div className={clsx('app-grid-container', classes.container)}>
        <AppSearchBar
          search={search}
          CreateIcon={AddCommentIcon}
          leftComponent={
            <IconButton
              onClick={(event) => setFilterMenuAnchor(event.currentTarget as HTMLElement)}
            >
              {
                (selectedCategoriesString && selectedCategoriesString.split(',').length > 0)
                  ? (
                    <Badge badgeContent={selectedCategoriesString.split(',').length} color="primary">
                      <FilterMenuOutlineIcon fontSize="small" />
                    </Badge>
                  )
                  : <FilterMenuOutlineIcon fontSize="small" />
              }
            </IconButton>
          }
          onSearchChange={(search) => setInputSearch(search)}
          onCreateClick={() => setCreateQuestionOpen(true)}
        />
        <Box className={classes.itemsWrapper}>
          {
            queryQuestionsLoading
              ? (
                <AppIndicator type="loading" />
              )
              : (
                questionItems.length === 0
                  ? (
                    <AppIndicator type="empty" />
                  )
                  : (
                    questionItems.map((questionItem, index) => {
                      return (
                        <AppQuestionItem
                          key={questionItem.id}
                          selectable={true}
                          answerable={false}
                          selected={selectedQuestions.findIndex((question) => questionItem.id === question.id) !== -1}
                          classes={{ root: classes.item }}
                          question={pipeQuestionResponseToMetadata(questionItem)}
                          onUpdateQuestion={() => {
                            refreshQueryQuestions();
                          }}
                          onDeleteQuestion={() => {
                            refreshQueryQuestions();
                          }}
                          onSelectQuestion={() => {
                            setSelectedQuestions([...selectedQuestions, questionItem]);
                          }}
                          onCancelSelectQuestion={() => {
                            setSelectedQuestions(selectedQuestions.filter((currentSelectedQuestion) => {
                              return currentSelectedQuestion.id !== questionItem.id;
                            }));
                          }}
                        />
                      );
                    })
                  )
              )
          }
        </Box>
        {
          selectedQuestions.length > 0 && (
            <Box className={classes.buttonsWrapper}>
              <Button
                color="primary"
                variant="outlined"
                startIcon={<PlaylistPlusIcon />}
                onClick={(event) => setAddQuestionMenuAnchor(event.target as HTMLElement)}
              >{pageTexts['004']} ({selectedQuestions.length})</Button>
              <Menu
                open={Boolean(addQuestionMenuAnchor)}
                anchorEl={addQuestionMenuAnchor}
                classes={{ paper: classes.addQuestionMenu }}
                onClose={() => setAddQuestionMenuAnchor(null)}
              >
                <Box className={classes.addQuestionMenuSearchWrapper}>
                  <TextField
                    variant="standard"
                    label={pageTexts['006']}
                    fullWidth={true}
                    onChange={(event) => setPaperSearchValue(event.target.value)}
                  />
                </Box>
                {
                  debouncedPaperSearchValue && (
                    <Box className={classes.addQuestionMenuItemsWrapper}>
                      {
                        papersLoading
                          ? <AppIndicator type="loading" />
                          : (
                            papers.length === 0
                              ? <AppIndicator type="empty" />
                              : papers.map((paper) => {
                                return (
                                  <div
                                    key={paper.id}
                                    onClick={() => {
                                      setCurrentSelectedPaper(paper);
                                      setPaperEditorMode('edit');
                                      setPaperEditorOpen(true);
                                    }}
                                  >
                                    <MenuItem>{paper.title}</MenuItem>
                                  </div>
                                );
                              })
                          )
                      }
                    </Box>
                  )
                }
              </Menu>
              <Button
                color="primary"
                variant="outlined"
                onClick={() => {
                  setPaperEditorMode('create');
                  setPaperEditorOpen(true);
                }}
              >{pageTexts['007']}</Button>
              <Button
                classes={{ root: classes.deleteButton }}
                onClick={() => {
                  AppDialogManager.confirm(pageTexts['005'], {
                    onConfirm: () => {
                      deleteQuestions(selectedQuestions.map((question) => question.id)).finally(() => {
                        setSelectedQuestions([]);
                        refreshQueryQuestions();
                      });
                    },
                  });
                }}
              >{systemTexts['DELETE']} ({selectedQuestions.length})</Button>
            </Box>
          )
        }
        {
          questionItems.length > 0 && (
            <TablePagination
              style={{ overflow: 'initial' }}
              component={Box}
              page={page - 1}
              rowsPerPage={size}
              count={totalQuestions}
              rowsPerPageOptions={[5, 10, 20, 50]}
              labelRowsPerPage={tableTexts['001']}
              backIconButtonText={tableTexts['002']}
              nextIconButtonText={tableTexts['003']}
              labelDisplayedRows={({ from, to, count }) => `${count} ${tableTexts['004']} ${from}-${to}`}
              onChangePage={(event, newPageNumber) => {
                history.push({
                  search: pushSearch(history, {
                    page: newPageNumber + 1,
                  }),
                });
              }}
              onChangeRowsPerPage={(event) => {
                history.push({
                  search: pushSearch(history, {
                    size: event.target.value,
                    page: 1,
                  }),
                });
              }}
            />
          )
        }
      </div>
      <AppPaperEditor
        paper={paperEditorMode === 'edit' ? currentSelectedPaper : null}
        mode={paperEditorMode}
        selectedIndex={1}
        open={paperEditorOpen && (paperEditorMode === 'edit' ? Boolean(currentSelectedPaper) : true)}
        initialQuestions={selectedQuestions}
        onSubmitPaper={clearSelection}
        onClose={clearSelection}
      />
      <AppQuestionEditor
        mode="create"
        open={createQuestionOpen}
        onSubmitQuestion={() => {
          setCreateQuestionOpen(false);
          refreshQueryQuestions();
        }}
        onClose={() => setCreateQuestionOpen(false)}
      />
      <Menu
        open={Boolean(filterMenuAnchor)}
        anchorEl={filterMenuAnchor}
        classes={{ paper: classes.filterMenu }}
        onClose={() => setFilterMenuAnchor(null)}
      >
        <Typography
          variant="subtitle2"
          classes={{ root: classes.filterMenuTitle }}
        >
          {pageTexts['003']}
          {
            getCategoriesLoading && (
              <CircularProgress size={15} />
            )
          }
        </Typography>
        <Box className={classes.categoriesWrapper}>
          {
            categories.length === 0
              ? (
                <Box className={classes.categoriesMenuEmptyWrapper}>
                  <Typography color="textSecondary">{systemTexts['EMPTY']}</Typography>
                </Box>
              )
              : categories.map((category, index) => {
                return (
                  <Box
                    key={index}
                    onClick={() => {
                      const selectedCategories = selectedCategoriesString
                        ? selectedCategoriesString.split(',').map((value) => parseInt(value, 10))
                        : [];
                      let newSelectedCategories = [];
                      if (selectedCategories.indexOf(category.id) !== -1) {
                        newSelectedCategories = selectedCategories.filter((value) => value !== category.id);
                      } else {
                        newSelectedCategories = selectedCategories.concat(category.id);
                      }
                      history.push(pushSearch(history, {
                        categories: newSelectedCategories.join(','),
                      }));
                    }}
                  >
                    <MenuItem
                      classes={{
                        root: clsx({
                          [classes.selectedCategoryItem]: selectedCategoriesString.split(',').indexOf(category.id.toString()) !== -1,
                        }),
                      }}
                    >
                      <Checkbox
                        color="primary"
                        checked={selectedCategoriesString.split(',').indexOf(category.id.toString()) !== -1}
                        onChange={(event) => event.preventDefault()}
                      />
                      {category.name}
                    </MenuItem>
                  </Box>
                );
              })
          }
        </Box>
      </Menu>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(QuestionsPage);
