import { queryQuestions } from './service';
import { ConnectState } from '../../../models';
import { AppState } from '../../../models/app';
import { connect } from '../../../patches/dva';
import { usePageTexts, useTexts } from '../../../utils/texts';
import { Dispatch, QuestionCategory, QuestionResponseData } from '../../../interfaces';
import AppQuestionEditor from '../../../components/AppQuestionEditor';
import { getAllCategoriesWithoutPagination } from '../../../components/AppQuestionEditor/service';
import AppQuestionItem from '../../../components/AppQuestionItem';
import { useDebouncedValue } from '../../../utils/hooks';
import { pushSearch, useLocationQuery } from '../../../utils/history';
import { usePaginationRequest, useRequest } from '../../../utils/request';
import { pipeQuestionResponseToMetadata } from '../../../utils/pipes';
import AppSearchBar from '../../../components/AppSearchBar';
import AppIndicator from '../../../components/AppIndicator';
import Badge from '@material-ui/core/Badge';
import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import TablePagination from '@material-ui/core/TablePagination';
import Typography from '@material-ui/core/Typography';
import AddCommentIcon from '@material-ui/icons/AddComment';
import FilterMenuOutlineIcon from 'mdi-material-ui/FilterMenuOutline';
import IconButton from '@material-ui/core/IconButton';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { lighten, makeStyles } from '@material-ui/core';
import clsx from 'clsx';

export interface QuestionPageProps extends AppState, ConnectState, Dispatch {}

const useStyles = makeStyles((theme) => {
  return {
    itemsWrapper: {
      padding: theme.spacing(2),
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
  };
});

const QuestionsPage: React.FC<QuestionPageProps> = ({
  dispatch,
}) => {
  const classes = useStyles();
  const history = useHistory();
  const editorTexts = useTexts(dispatch, 'editor');
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
  const [filterMenuOpen, setFilterMenuOpen] = useState<boolean>(false);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<HTMLElement>(null);
  const [createQuestionOpen, setCreateQuestionOpen] = useState<boolean>(false);

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
          CreateIcon={AddCommentIcon}
          leftComponent={
            <IconButton
              ref={(ref) => setFilterMenuAnchor(ref)}
              onClick={() => setFilterMenuOpen(true)}
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
        <AppQuestionEditor
          mode="create"
          open={createQuestionOpen}
          onSubmitQuestion={() => {
            setCreateQuestionOpen(false);
            refreshQueryQuestions();
          }}
          onClose={() => setCreateQuestionOpen(false)}
        />
        <Box className={classes.itemsWrapper}>
          <Menu
            open={filterMenuOpen}
            anchorEl={filterMenuAnchor}
            classes={{ paper: classes.filterMenu }}
            onClose={() => setFilterMenuOpen(false)}
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
                    <>
                      {
                        questionItems.map((questionItem, index) => {
                          return (
                            <AppQuestionItem
                              key={questionItem.id}
                              selectable={true}
                              answerable={false}
                              classes={{ root: classes.item }}
                              question={pipeQuestionResponseToMetadata(questionItem)}
                              onUpdateQuestion={() => {
                                refreshQueryQuestions();
                              }}
                              onDeleteQuestion={() => {
                                refreshQueryQuestions();
                              }}
                            />
                          );
                        })
                      }
                      <TablePagination
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
                    </>
                  )
              )
          }
        </Box>
      </div>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(QuestionsPage);
