import PaperQuestionItem from './PaperQuestionItem';
import { getPaperQuestions } from './service';
import { AppState } from '../../models/app';
import { Dispatch } from '../../interfaces';
import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import { useTexts } from '../../utils/texts';
import { AppQuestionMetaData } from '../AppQuestionEditor';
import Input from '../AppSearchBar/Input';
import { useDebouncedValue } from '../../utils/hooks';
import { useRequest } from '../../utils/request';
import React, { useEffect, useState } from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputBase from '@material-ui/core/InputBase';
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
  };
});

const AppPaperEditor: React.FC<AppPaperEditorComponentProps> = ({
  paperId,
  dispatch,
  ...props
}) => {
  const classes = useStyles();
  const texts = useTexts(dispatch, 'paperEditor');
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

  useEffect(() => {

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
                  >{texts['ADD_QUESTION']}</Button>
                </Box>
                <Box className={classes.questionsWrapper}>
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
              onValueChange={(value) => setQuestionSearchValue(value)}
            />
          </Box>
        </DialogTitle>
      </Dialog>
    </>
  );
};

export default connect(({ app }: ConnectState) => app)(AppPaperEditor) as React.FC<AppPaperEditorProps>;
