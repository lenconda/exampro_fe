import PaperQuestionItem from './PaperQuestionItem';
import { createPaperQuestion, getPaperQuestionsWithAnswers, queryAllQuestions } from './service';
import { AppState } from '../../models/app';
import { Dispatch, PaperQuestionResponseData, QuestionResponseData } from '../../interfaces';
import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import { useTexts } from '../../utils/texts';
import { AppQuestionMetaData } from '../AppQuestionEditor';
import Input from '../AppSearchBar/Input';
import { useDebouncedValue } from '../../utils/hooks';
import { useRequest } from '../../utils/request';
import AppQuestionItem from '../AppQuestionItem';
import { pipeQuestionResponseToMetadata } from '../../utils/pipes';
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
import Typography from '@material-ui/core/Typography';
import FileQuestionIcon from 'mdi-material-ui/FileQuestion';
import PostAddIcon from '@material-ui/icons/PostAdd';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
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
    buttonsWrapper: {
      marginTop: theme.spacing(2),
    },
    textfield: {
      marginBottom: theme.spacing(4),
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
  const [currentPaperQuestions, setCurrentPaperQuestions] = useState<PaperQuestionResponseData[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<AppQuestionMetaData[]>([]);
  const [questionSelectorOpen, setQuestionSelectorOpen] = useState<boolean>(false);
  const [questionSearchValue, setQuestionSearchValue] = useState<string>('');
  const debouncedQuestionSearchValue = useDebouncedValue(questionSearchValue);
  const [
    paperQuestions = [],
    paperQuestionsLoading,
  ] = useRequest(getPaperQuestionsWithAnswers, [paperId]);

  const [allQuestions, setAllQuestions] = useState<QuestionResponseData[]>([]);
  const [allQuestionsLoading, setAllQuestionsLoading] = useState<boolean>(false);

  const reorderPaperQuestions = (
    list: PaperQuestionResponseData[],
    startIndex: number,
    endIndex: number,
  ): PaperQuestionResponseData[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination || !source) {
      return;
    }
    const newPaperQuestions = reorderPaperQuestions(Array.from(currentPaperQuestions), source.index, destination.index);
    setCurrentPaperQuestions(newPaperQuestions.map((paperQuestion, index) => {
      return {
        ...paperQuestion,
        order: index + 1,
      };
    }));
  };

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
      setCurrentPaperQuestions(paperQuestions);
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
          {
            tabs[selectedTabIndex] === 'QUESTIONS' && (
              <Box className={classes.buttonsWrapper}>
                <Button
                  variant="outlined"
                  startIcon={<PostAddIcon />}
                  onClick={() => setQuestionSelectorOpen(true)}
                >{texts['SELECT_QUESTIONS']}</Button>
              </Box>
            )
          }
        </DialogTitle>
        <DialogContent>
          {
            tabs[selectedTabIndex] === 'BASE_SETTINGS' && (
              <>
                <TextField
                  variant="outlined"
                  label={texts['ENTER_TITLE']}
                  fullWidth={true}
                  classes={{
                    root: classes.textfield,
                  }}
                />
                <TextField
                  variant="outlined"
                  label={texts['MISS_CHOICE_POINTS']}
                  fullWidth={true}
                  type="number"
                  classes={{
                    root: classes.textfield,
                  }}
                />
              </>
            )
          }
          {
            tabs[selectedTabIndex] === 'QUESTIONS' && (
              <>
                <Box className={classes.questionsWrapper}>
                  {
                    paperQuestionsLoading
                      ? (
                        <div className="app-loading">
                          <CircularProgress classes={{ root: 'app-loading__icon' }} />
                        </div>
                      )
                      : paperQuestions.length > 0
                        ? (
                          <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="paper-questions">
                              {
                                (provided) => {
                                  return (
                                    <Paper elevation={0} ref={provided.innerRef}>
                                      {
                                        currentPaperQuestions.map((paperQuestion, index) => {
                                          const question = pipeQuestionResponseToMetadata(paperQuestion.question);
                                          return (
                                            <PaperQuestionItem
                                              key={question.id}
                                              draggableId={question.id.toString()}
                                              index={index}
                                              questionNumber={index + 1}
                                              question={question}
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
                        : (
                          <div className="app-empty">
                            <FileQuestionIcon classes={{ root: 'app-empty__icon' }} />
                            <Typography classes={{ root: 'app-empty__text' }}>{systemTexts['EMPTY']}</Typography>
                          </div>
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
                        checked={currentPaperQuestions.findIndex((currentQuestion) => question.id === currentQuestion.question.id) !== -1}
                        onChange={(event) => {
                          const checked = event.target.checked;
                          if (checked) {
                            setCurrentPaperQuestions(currentPaperQuestions.concat(createPaperQuestion(question, 0)));
                          } else {
                            setCurrentPaperQuestions(currentPaperQuestions.filter((currentQuestions) => currentQuestions.id !== question.id));
                          }
                        }}
                      />
                      <AppQuestionItem
                        classes={{ root: classes.questionSelectorItem }}
                        answerable={false}
                        question={pipeQuestionResponseToMetadata(question)}
                        showButtons={[]}
                      />
                    </Paper>
                  );
                })
                : (
                  <div className="app-empty">
                    <FileQuestionIcon classes={{ root: 'app-empty__icon' }} />
                    <Typography classes={{ root: 'app-empty__text' }}>{systemTexts['EMPTY']}</Typography>
                  </div>
                )
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
