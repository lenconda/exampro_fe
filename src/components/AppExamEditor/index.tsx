import { createPaper, createPaperMaintainers, createPaperQuestion, createPaperQuestions, getPaperMaintainers, getPaperQuestionsWithAnswers, queryAllQuestions, queryAllUsers, updatePaper } from './service';
import { AppState } from '../../models/app';
import { Dispatch, ExamResponseData, PaperQuestionResponseData, PaperResponseData, QuestionResponseData, User } from '../../interfaces';
import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import { useTexts } from '../../utils/texts';
import Input from '../AppSearchBar/Input';
import { useDebouncedValue } from '../../utils/hooks';
import AppQuestionItem from '../AppQuestionItem';
import { pipeQuestionResponseToMetadata } from '../../utils/pipes';
import AppUserItem from '../AppUserItem';
import React, { useEffect, useState } from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Paper from '@material-ui/core/Paper';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import CheckIcon from '@material-ui/icons/Check';
import DeleteIcon from '@material-ui/icons/Delete';
import FileQuestionIcon from 'mdi-material-ui/FileQuestion';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { makeStyles } from '@material-ui/core';
import _ from 'lodash';

export interface AppExamEditorProps extends DialogProps {
  mode?: 'create' | 'edit';
  exam?: ExamResponseData;
  onSubmitExam?(): void;
}

export interface AppExamEditorComponentProps extends AppState, Dispatch, AppExamEditorProps {}

const useStyles = makeStyles((theme) => {
  return {
    searchWrapper: {
      display: 'flex',
      alignItems: 'stretch',
      marginTop: theme.spacing(2),
      '& button': {
        marginLeft: theme.spacing(2),
      },
    },
    buttonsWrapper: {
      marginTop: theme.spacing(2),
      display: 'flex',
      overflowX: 'scroll',
    },
    deleteButton: {
      color: theme.palette.error.main,
    },
  };
});

const AppExamEditor: React.FC<AppExamEditorComponentProps> = ({
  exam,
  mode = 'create',
  dispatch,
  onClose,
  onSubmitExam,
  ...props
}) => {
  let tabs = [];

  if (mode === 'create') {
    tabs = ['BASIC_SETTINGS', 'MAINTAINERS', 'INVIGILATORS', 'REVIEWERS', 'PARTICIPANTS'];
  } else if (mode === 'edit') {
    switch (_.get(exam, 'role.id')) {
    case 'resource/exam/initiator': {
      tabs = ['BASIC_SETTINGS', 'MAINTAINERS', 'INVIGILATORS', 'REVIEWERS', 'PARTICIPANTS'];
      break;
    }
    case 'resource/exam/maintainer': {
      tabs = ['BASIC_SETTINGS', 'INVIGILATORS', 'REVIEWERS', 'PARTICIPANTS'];
      break;
    }
    default:
      break;
    }
  }

  const classes = useStyles();
  const texts = useTexts(dispatch, 'examEditor');
  const systemTexts = useTexts(dispatch, 'system');
  const searchBarTexts = useTexts(dispatch, 'searchBar');

  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchContent, setSearchContent] = useState<string>('');
  const debouncedSearchContent = useDebouncedValue(searchContent);

  const [submitting, setSubmitting] = useState<boolean>(false);

  return (
    <>
      <Dialog {...props} scroll="paper" maxWidth="md" fullWidth={true}>
        <DialogTitle>
          {texts['TITLE']}
          <Box>
            <Tabs
              value={selectedTabIndex}
              variant="scrollable"
              indicatorColor="primary"
              textColor="primary"
            >
              {
                tabs.map((tab, index) => {
                  return (
                    <Tab
                      key={index}
                      label={texts[tab]}
                      onClick={() => setSelectedTabIndex(index)}
                    />
                  );
                })
              }
            </Tabs>
          </Box>
          {
            (tabs[selectedTabIndex] === 'MAINTAINER') && (
              <>
                <Box className={classes.searchWrapper}>
                  <Input
                    placeholder={searchBarTexts['INPUT_TO_QUERY']}
                    value={searchContent}
                    onFocus={() => setIsSearching(true)}
                    onValueChange={(value) => setSearchContent(value)}
                  />
                  {
                    isSearching && (
                      <Button
                        variant="contained"
                        color="inherit"
                        startIcon={<CheckIcon />}
                        onClick={() => {
                          setIsSearching(false);
                          setSearchContent('');
                        }}
                      >{systemTexts['OK']}</Button>
                    )
                  }
                </Box>
                <Box className={classes.buttonsWrapper}>
                  <Button
                    variant="text"
                    startIcon={<DeleteIcon />}
                    classes={{
                      root: classes.deleteButton,
                    }}
                    // onClick={}
                  >
                    {systemTexts['DELETE']}&nbsp;
                    {/* {
                      tabs[selectedTabIndex] === 'QUESTIONS' && `(${selectedPaperQuestions.length})`
                    }
                    {
                      tabs[selectedTabIndex] === 'MAINTAINER' && `(${selectedMaintainers.length})`
                    } */}
                  </Button>
                </Box>
              </>
            )
          }
        </DialogTitle>
        <DialogContent>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            disabled={submitting}
            onClick={() => {
              if (_.isFunction(onClose)) {
                onClose();
              }
            }}
          >{systemTexts['CANCEL']}</Button>
          <Button
            color="primary"
            // disabled={!validatePaperData(paperData, currentPaperQuestions) || submitting}
            onClick={() => {
              if (mode === 'edit' && !exam) {
                return;
              }
              setSubmitting(true);
              // const request = mode === 'create' ? createPaper(paperData) : updatePaper(paper.id, paperData);
              // request
              //   .then((res) => {
              //     const id = mode === 'create' ? _.get(res, 'id') : paper.id;
              //     if (_.isNumber(id)) {
              //       const requests = [
              //         createPaperQuestions(id, currentPaperQuestions),
              //         ...(currentMaintainers.length ? [
              //           createPaperMaintainers(id, currentMaintainers),
              //         ] : []),
              //       ];
              //       return Promise.all(requests);
              //     }
              //     return;
              //   })
              //   .then(() => {
              //     if (_.isFunction(onSubmitExam)) {
              //       onSubmitExam();
              //     }
              //   })
              //   .finally(() => setSubmitting(false));
            }}
          >{submitting ? systemTexts['SUBMITTING'] : systemTexts['SUBMIT']}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default connect(({ app }: ConnectState) => app)(AppExamEditor) as React.FC<AppExamEditorProps>;
