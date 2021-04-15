import { queryQuestions } from './service';
import { ConnectState } from '../../../models';
import { AppState } from '../../../models/app';
import { connect } from '../../../patches/dva';
import { usePageTexts, useTexts } from '../../../utils/texts';
import { Dispatch, QuestionResponseData } from '../../../interfaces';
import AppQuestionEditor, { AppQuestionMetaData } from '../../../components/AppQuestionEditor';
import { getQuestionWithAnswers } from '../../../components/AppQuestionEditor/service';
import AppQuestionItem from '../../../components/AppQuestionItem';
import { useDebouncedValue } from '../../../utils/hooks';
import { pushSearch, useLocationQuery } from '../../../utils/history';
import { usePaginationRequest } from '../../../utils/request';
import { pipeQuestionResponseToMetadata } from '../../../utils/pipes';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Menu from '@material-ui/core/Menu';
import Typography from '@material-ui/core/Typography';
import FilterMenuOutlineIcon from 'mdi-material-ui/FilterMenuOutline';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import Paper from '@material-ui/core/Paper';
import NotePlusIcon from 'mdi-material-ui/NotePlus';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { makeStyles } from '@material-ui/core';
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
    },
    categoriesWrapper: {
      maxHeight: 420,
      overflowY: 'scroll',
      padding: theme.spacing(2),
    },
    controlsWrapper: {
      padding: theme.spacing(2),
      paddingBottom: 0,
    },
  };
});

const QuestionsPage: React.FC<QuestionPageProps> = ({
  dispatch,
}) => {
  const classes = useStyles();
  const history = useHistory();
  const editorTexts = useTexts(dispatch, 'editor');
  const systemTexts = useTexts(dispatch, 'system');
  const pageTexts = usePageTexts(dispatch, '/home/questions');
  const [inputSearch, setInputSearch] = useState<string>(undefined);
  const debouncedSearch = useDebouncedValue(inputSearch);
  const search = useLocationQuery('search');
  const [
    questionItems,
    totalQuestions = 0,
    queryQuestionsLoading,
    page,
    size,
  ] = usePaginationRequest<QuestionResponseData>(queryQuestions);
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
            <FilterMenuOutlineIcon />
          </IconButton>
          <Menu
            open={filterMenuOpen}
            anchorEl={filterMenuAnchor}
            classes={{ paper: classes.filterMenu }}
          >
            <Typography
              variant="subtitle1"
              classes={{ root: classes.filterMenuTitle }}
            >{pageTexts['003']}</Typography>
            <Box className={classes.categoriesWrapper}></Box>
            <Box className={classes.controlsWrapper}>
              <Button color="primary">{systemTexts['OK']}</Button>
              <Button color="primary">{systemTexts['CANCEL']}</Button>
            </Box>
          </Menu>
          {
            queryQuestionsLoading
              ? (
                <div className="app-loading">
                  <CircularProgress classes={{ root: 'app-loading__icon' }} />
                </div>
              )
              : questionItems.map((questionItem, index) => {
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
        </Box>
      </div>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(QuestionsPage);
