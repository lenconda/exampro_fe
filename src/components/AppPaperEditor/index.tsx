import PaperQuestionItem from './PaperQuestionItem';
import { getPaperQuestions, queryAllQuestions } from './service';
import { AppState } from '../../models/app';
import { Dispatch } from '../../interfaces';
import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import { useTexts } from '../../utils/texts';
import { AppQuestionMetaData } from '../AppQuestionEditor';
import Input from '../AppSearchBar/Input';
import { useDebouncedValue } from '../../utils/hooks';
import { useRequest } from '../../utils/request';
import { getUserProfile } from '../../pages/Home/service';
import AppQuestionItem from '../AppQuestionItem';
import React, { useEffect, useState } from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import TextField from '@material-ui/core/TextField';
import PostAddIcon from '@material-ui/icons/PostAdd';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { makeStyles } from '@material-ui/core';
// import { Field, Form as FormikForm, Formik } from 'formik';

// const Form = FormikForm as any;

export interface AppPaperEditorProps extends DialogProps {
  paperId?: number;
}
export interface AppPaperEditorComponentProps extends AppState, Dispatch, AppPaperEditorProps {}

const tabs = ['BASE_SETTINGS', 'QUESTIONS', 'MAINTAINER'];

const useStyles = makeStyles((theme) => {
  return {
    questionsWrapper: {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    },
    questionSelectorSearchWrapper: {
      marginTop: theme.spacing(1),
    },
    questionSelectorItemWrapper: {
      marginBottom: theme.spacing(1),
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
    questionSelectorItem: {
      flexGrow: 1,
      flexShrink: 1,
      marginLeft: theme.spacing(1),
    },
  };
});

const AppPaperEditor: React.FC<AppPaperEditorComponentProps> = ({
  paperId,
  dispatch,
  ...props
}) => {
  const classes = useStyles();
  const texts = useTexts(dispatch, 'paperEditor');
  const systemTexts = useTexts(dispatch, 'system');
  const searchBarTexts = useTexts(dispatch, 'searchBar');
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
  const [questions, setQuestions] = useState<AppQuestionMetaData[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<AppQuestionMetaData[]>([]);
  const [questionSelectorOpen, setQuestionSelectorOpen] = useState<boolean>(false);
  const [questionSearchValue, setQuestionSearchValue] = useState<string>('');
  const debouncedQuestionSearchValue = useDebouncedValue(questionSearchValue);
  const [
    paperQuestions = [],
    paperQuestionsLoading,
  ] = useRequest(getPaperQuestions, [paperId]);
  const [profile] = useRequest(getUserProfile);

  const [allQuestions, setAllQuestions] = useState<AppQuestionMetaData[]>([]);
  const [allQuestionsLoading, setAllQuestionsLoading] = useState<boolean>(false);

  const getAllQuestions = (search: string) => {
    setAllQuestionsLoading(true);
    queryAllQuestions(search).then((res) => {
      setAllQuestions(res);
    }).finally(() => setAllQuestionsLoading(false));
  };

  useEffect(() => {
    getAllQuestions(debouncedQuestionSearchValue);
  }, [debouncedQuestionSearchValue]);

  useEffect(() => {
    if (!paperQuestionsLoading) {
      setQuestions(paperQuestions);
    }
  }, [paperQuestions, paperQuestionsLoading]);

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
        </DialogTitle>
        <DialogContent>
          {
            tabs[selectedTabIndex] === 'BASE_SETTINGS' && (
              <TextField label={texts['ENTER_TITLE']} fullWidth={true} />
            )
          }
          {
            tabs[selectedTabIndex] === 'QUESTIONS' && (
              <>
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<PostAddIcon />}
                    onClick={() => setQuestionSelectorOpen(true)}
                  >{texts['SELECT_QUESTIONS']}</Button>
                </Box>
                <Box className={classes.questionsWrapper}>
                  {
                    paperQuestionsLoading
                      ? (
                        <div className="app-loading">
                          <CircularProgress classes={{ root: 'app-loading__icon' }} />
                        </div>
                      )
                      : (
                        <DragDropContext onDragEnd={() => {}}>
                          <Droppable droppableId="paper-questions">
                            {
                              (provided) => {
                                return (
                                  <Paper elevation={0} ref={provided.innerRef}>
                                    {
                                      questions.map((question, index) => {
                                        return (
                                          <PaperQuestionItem
                                            key={index}
                                            draggableId={index.toString()}
                                            index={index}
                                            questionNumber={index + 1}
                                            question={question}
                                            profile={profile}
                                            selected={selectedQuestions.findIndex((currentQuestion) => question.id === currentQuestion.id) !== -1}
                                            onSelect={() => setSelectedQuestions(selectedQuestions.concat(question))}
                                            onCancelSelect={() => {
                                              setSelectedQuestions(selectedQuestions.filter((currentQuestion) => {
                                                return currentQuestion.id !== question.id;
                                              }));
                                            }}
                                          />
                                        );
                                      })
                                    }
                                    {provided.placeholder}
                                  </Paper>
                                );
                              }
                            }
                          </Droppable>
                        </DragDropContext>
                      )
                  }
                </Box>
              </>
            )
          }
        </DialogContent>
        <DialogActions></DialogActions>
      </Dialog>
      <Dialog
        open={questionSelectorOpen}
        fullWidth={true}
      >
        <DialogTitle>
          {texts['SELECT_QUESTIONS']}
          <Box className={classes.questionSelectorSearchWrapper}>
            <Input
              placeholder={searchBarTexts['INPUT_TO_QUERY']}
              value={questionSearchValue}
              onValueChange={(value) => setQuestionSearchValue(value)}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {
            allQuestionsLoading
              ? (
                <div className="app-loading">
                  <CircularProgress classes={{ root: 'app-loading__icon' }} />
                </div>
              )
              : allQuestions.length > 0
                ? allQuestions.map((question, index) => {
                  return (
                    <Paper
                      key={index}
                      elevation={0}
                      classes={{ root: classes.questionSelectorItemWrapper }}
                    >
                      <Checkbox
                        color="primary"
                        checked={questions.findIndex((currentQuestion) => question.id === currentQuestion.id) !== -1}
                        onChange={(event) => {
                          const checked = event.target.checked;
                          if (checked) {
                            setQuestions(questions.concat(question));
                          } else {
                            setQuestions(questions.filter((currentQuestions) => currentQuestions.id !== question.id));
                          }
                        }}
                      />
                      <AppQuestionItem
                        classes={{ root: classes.questionSelectorItem }}
                        answerable={false}
                        question={question}
                        showButtons={[]}
                      />
                    </Paper>
                  );
                })
                : (<></>)
          }
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={() => setQuestionSelectorOpen(false)}
          >{systemTexts['CLOSE']}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default connect(({ app }: ConnectState) => app)(AppPaperEditor) as React.FC<AppPaperEditorProps>;
