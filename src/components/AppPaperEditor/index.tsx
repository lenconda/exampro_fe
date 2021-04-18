import PaperQuestionItem from './PaperQuestionItem';
import { AppState } from '../../models/app';
import { Dispatch } from '../../interfaces';
import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import { useTexts } from '../../utils/texts';
import { AppQuestionMetaData } from '../AppQuestionEditor';
import React, { useState } from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
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

export interface AppPaperEditorProps extends DialogProps {}
export interface AppPaperEditorComponentProps extends AppState, Dispatch, AppPaperEditorProps {}

const tabs = ['BASE_SETTINGS', 'QUESTIONS', 'MAINTAINER'];

const useStyles = makeStyles((theme) => {
  return {
    questionsWrapper: {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    },
  };
});

const AppPaperEditor: React.FC<AppPaperEditorComponentProps> = ({
  dispatch,
  ...props
}) => {
  const classes = useStyles();
  const texts = useTexts(dispatch, 'paperEditor');
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
  const [questions, setQuestions] = useState<AppQuestionMetaData[]>([]);

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
                                    />
                                  );
                                })
                              }
                              <PaperQuestionItem draggableId="1" index={1} />
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
    </>
  );
};

export default connect(({ app }: ConnectState) => app)(AppPaperEditor) as React.FC<AppPaperEditorProps>;
