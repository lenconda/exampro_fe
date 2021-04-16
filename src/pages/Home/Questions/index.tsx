import { queryQuestions } from './service';
import { ConnectState } from '../../../models';
import { AppState } from '../../../models/app';
import { connect } from '../../../patches/dva';
import { usePageTexts, useTexts } from '../../../utils/texts';
import { Dispatch, QuestionCategory, QuestionResponseData } from '../../../interfaces';
import AppQuestionEditor, { AppQuestionMetaData } from '../../../components/AppQuestionEditor';
import { getAllCategoriesWithoutPagination, getQuestionWithAnswers } from '../../../components/AppQuestionEditor/service';
import AppQuestionItem from '../../../components/AppQuestionItem';
import { useDebouncedValue } from '../../../utils/hooks';
import { pushSearch, useLocationQuery } from '../../../utils/history';
import { usePaginationRequest, useRequest } from '../../../utils/request';
import { pipeQuestionResponseToMetadata } from '../../../utils/pipes';
import Badge from '@material-ui/core/Badge';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import TablePagination from '@material-ui/core/TablePagination';
import Typography from '@material-ui/core/Typography';
import FileQuestionIcon from 'mdi-material-ui/FileQuestion';
import FilterMenuOutlineIcon from 'mdi-material-ui/FilterMenuOutline';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import Paper from '@material-ui/core/Paper';
import NotePlusIcon from 'mdi-material-ui/NotePlus';
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
    filterButton: {
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
  const search = useLocationQuery('search');
  const selectedCategoriesString = (useLocationQuery('categories') || '') as string;
  const [
    questionItems = [],
    totalQuestions = 0,
    queryQuestionsLoading,
    page,
    size,
  ] = usePaginationRequest<QuestionResponseData>(queryQuestions, { categories: selectedCategoriesString });
  const [categories = [], getCategoriesLoading] = useRequest<QuestionCategory[]>(getAllCategoriesWithoutPagination, []);
  const [queryInputFocused, setQueryInputFocused] = useState<boolean>(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState<boolean>(false);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<HTMLElement>(null);

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
              defaultValue={search}
              onFocus={() => setQueryInputFocused(true)}
              onBlur={() => setQueryInputFocused(false)}
              onChange={(event) => setInputSearch(event.target.value)}
            />
          </Paper>
          <Button
            classes={{
              root: clsx(
                'app-page-interact-wrapper__button',
                queryInputFocused ? 'collapsed' : '',
              ),
            }}
            color="primary"
            startIcon={!queryInputFocused ? <NotePlusIcon /> : null}
            variant="contained"
          >{!queryInputFocused ? pageTexts['002'] : null}</Button>
        </div>
        <Box className={classes.itemsWrapper}>
          <IconButton
            ref={(ref) => setFilterMenuAnchor(ref)}
            classes={{ root: classes.filterButton }}
            onClick={() => setFilterMenuOpen(true)}
          >
            {
              (selectedCategoriesString && selectedCategoriesString.split(',').length > 0)
                ? (
                  <Badge badgeContent={selectedCategoriesString.split(',').length} color="primary">
                    <FilterMenuOutlineIcon />
                  </Badge>
                )
                : <FilterMenuOutlineIcon />
            }
          </IconButton>
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
                <div className="app-loading">
                  <CircularProgress classes={{ root: 'app-loading__icon' }} />
                </div>
              )
              : (
                questionItems.length === 0
                  ? (
                    <div className="app-empty">
                      <FileQuestionIcon classes={{ root: 'app-empty__icon' }} />
                      <Typography classes={{ root: 'app-empty__text' }}>{systemTexts['EMPTY']}</Typography>
                    </div>
                  )
                  : (
                    <>
                      {
                        questionItems.map((questionItem, index) => {
                          return (
                            <AppQuestionItem
                              key={index}
                              answerable={false}
                              classes={{ root: classes.item }}
                              question={pipeQuestionResponseToMetadata(questionItem)}
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
