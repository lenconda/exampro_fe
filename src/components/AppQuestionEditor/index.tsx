import { Dispatch, Question, QuestionChoice, QuestionType } from '../../interfaces';
import { AppState } from '../../models/app';
import Editor from '../Editor';
import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import { useTexts } from '../../utils/texts';
import { useDebouncedValue, useUpdateEffect } from '../../utils/hooks';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Radio from '@material-ui/core/Radio';
import Select from '@material-ui/core/Select';
import Tooltip from '@material-ui/core/Tooltip';
import PlaylistAdd from '@material-ui/icons/PlaylistAdd';
import PlaylistAddCheck from '@material-ui/icons/PlaylistAddCheck';
import DragIndicator from '@material-ui/icons/DragIndicator';
import Check from '@material-ui/icons/Check';
import Close from '@material-ui/icons/Close';
import Delete from '@material-ui/icons/Delete';
import React, { useEffect, useState } from 'react';
import { lighten, makeStyles } from '@material-ui/core';
import DraftEditor, { ContentState, EditorState } from 'draft-js';
import _ from 'lodash';
import Typography from '@material-ui/core/Typography';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import clsx from 'clsx';

export interface AppQuestionEditorProps extends DialogProps {
  mode?: 'create' | 'edit';
  onSubmitQuestion?(question: Question): void;
}
export interface AppQuestionEditorConnectedProps extends Dispatch, AppState, AppQuestionEditorProps {}

export const CACHE_KEYS = {
  SAVE_DRAFT: 'saveQuestionDraft',
  QUESTION_CONTENT: 'questionContent',
  QUESTION_TYPE: 'questionType',
};

const useStyles = makeStyles((theme) => {
  return {
    wrapper: {
      borderWidth: 1,
      borderColor: theme.palette.grey[300],
      borderStyle: 'solid',
      marginBottom: theme.spacing(2),
    },
    content: {
    },
    editorWrapper: {
      height: 240,
      overflowY: 'scroll',
    },
    selectorsWrapper: {
      width: '100%',
      marginBottom: theme.spacing(2),
    },
    formControl: {
      minWidth: 120,
      marginRight: theme.spacing(2),
    },
    choicesTitle: {
      marginBottom: theme.spacing(1.5),
    },
    addQuestionPopover: {
      minWidth: 320,
      padding: theme.spacing(2),
    },
    addQuestionChoice: {
      position: 'relative',
      marginBottom: theme.spacing(2),
      '&:hover .delete-icon-button': {
        display: 'initial',
      },
    },
    addQuestionChoiceInputWrapper: {
      fontSize: theme.typography.h6.fontSize,
      display: 'flex',
      flexDirection: 'row',
    },
    addQuestionIcon: {
      position: 'absolute',
      left: theme.spacing(1),
      top: '50%',
      transform: 'translateY(-50%)',
      color: theme.palette.grey[600],
    },
    addQuestionInput: {
      paddingTop: theme.spacing(1),
      paddingRight: theme.spacing(2),
      paddingBottom: theme.spacing(1),
      paddingLeft: theme.spacing(2),
    },
    addQuestionIndicatorWrapper: {
      width: theme.spacing(5),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
      flexGrow: 0,
    },
    dragging: {
      boxShadow: theme.shadows[10],
    },
    selected: {
      backgroundColor: lighten(theme.palette.primary.light, 0.85),
    },
    button: {
      marginRight: theme.spacing(1),
    },
    isAnswerTagWrapper: {
      display: 'flex',
      alignItems: 'center',
    },
    deleteButton: {
      display: 'none',
    },
  };
});

export type QuestionChoiceWithAnswer = QuestionChoice & {
  isAnswer: boolean;
};

const AppQuestionEditor: React.FC<AppQuestionEditorConnectedProps> = ({
  mode = 'create',
  dispatch,
  onClose,
  onSubmitQuestion,
  ...props
}) => {
  const texts = useTexts(dispatch, 'questionEditor');
  const editorTexts = useTexts(dispatch, 'editor');
  const systemTexts = useTexts(dispatch, 'system');
  const classes = useStyles();
  const [contentState, setContentState] = useState<ContentState>(null);
  const debouncedContentState = useDebouncedValue<ContentState>(contentState);
  const [showSetAnswer, setShowSetAnswer] = useState<boolean>(false);

  const [saveDraft, setSaveDraft] = useState<boolean>(JSON.parse(localStorage.getItem(CACHE_KEYS.SAVE_DRAFT) || 'false'));
  const [questionType, setQuestionType] = useState<QuestionType>(localStorage.getItem(CACHE_KEYS.QUESTION_TYPE) as QuestionType || 'short_answer');
  const [questionChoices, setQuestionChoices] = useState<Partial<QuestionChoiceWithAnswer>[]>([]);

  const cachedContentState = localStorage.getItem(CACHE_KEYS.QUESTION_CONTENT);
  const defaultContentState = (cachedContentState && mode === 'create')
    ? DraftEditor.convertFromRaw(JSON.parse(cachedContentState))
    : EditorState.createEmpty().getCurrentContent();

  const validateChoiceContent = (choices: Partial<QuestionChoiceWithAnswer>[]) => {
    for (const choice of choices) {
      if (!choice.content) {
        return false;
      }
    }
    return true;
  };

  const validateChoiceCount = (type: QuestionType, choices: Partial<QuestionChoiceWithAnswer>[]) => {
    if (type === 'multiple_choices') {
      return choices.length >= 3;
    } else if (type === 'single_choice') {
      return choices.length >= 2;
    } else {
      return false;
    }
  };

  const handleRemoveCache = (keys) => {
    Object.keys(keys).forEach((key) => {
      localStorage.removeItem(keys[key]);
    });
  };

  const handleQuestionChoiceChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    index: number,
  ) => {
    setQuestionChoices(questionChoices.map((choice, choiceIndex) => {
      if (choiceIndex === index) {
        return {
          ...choice,
          content: event.target.value,
        };
      }
      return choice;
    }));
  };

  const handleSetAnswerChoice = (
    type: QuestionType,
    index: number,
    choices: Partial<QuestionChoiceWithAnswer>[],
  ) => {
    const newChoices = Array.from(choices).map((choice, currentChoiceIndex) => {
      if (type === 'multiple_choices') {
        if (currentChoiceIndex === index) {
          return {
            ...choice,
            isAnswer: !choice.isAnswer,
          } as QuestionChoiceWithAnswer;
        } else {
          return choice;
        }
      } else if (type === 'single_choice') {
        if (currentChoiceIndex === index) {
          return {
            ...choice,
            isAnswer: true,
          } as QuestionChoiceWithAnswer;
        } else {
          return {
            ...choice,
            isAnswer: false,
          } as QuestionChoiceWithAnswer;
        }
      } else {
        return choice;
      }
    });
    setQuestionChoices(newChoices);
  };

  const handleDeleteQuestionChoice = (index: number) => {
    setQuestionChoices(Array.from(questionChoices).filter((questionChoice, currentIndex) => {
      return index !== currentIndex;
    }));
  };

  const generateAnswerSelector = (
    type: QuestionType,
    index: number,
    choices: Partial<QuestionChoiceWithAnswer>[],
  ) => {
    let Selector;
    const currentChoice = choices[index];

    if (type === 'single_choice') {
      Selector = Radio;
    } else if (type === 'multiple_choices') {
      Selector = Checkbox;
    } else {
      return null;
    }

    return (
      <Selector
        checked={currentChoice.isAnswer}
        disabled={!currentChoice || !currentChoice.content}
        color="primary"
        onChange={() => {
          handleSetAnswerChoice(type, index, choices);
        }}
      />
    );
  };

  useEffect(() => {
    setQuestionChoices(Array.from(questionChoices).map((choice) => {
      return {
        ...choice,
        isAnswer: false,
      };
    }));
  }, [questionType]);

  useUpdateEffect(() => {
    if (saveDraft) {
      let contentStateString = JSON.stringify(DraftEditor.convertToRaw(EditorState.createEmpty().getCurrentContent()));
      if (debouncedContentState) {
        contentStateString = JSON.stringify(DraftEditor.convertToRaw(debouncedContentState));
      }
      localStorage.setItem(CACHE_KEYS.SAVE_DRAFT, JSON.stringify(true));
      localStorage.setItem(CACHE_KEYS.QUESTION_CONTENT, contentStateString);
      localStorage.setItem(CACHE_KEYS.QUESTION_TYPE, questionType);
    } else {
      handleRemoveCache(CACHE_KEYS);
    }
  }, [debouncedContentState, questionType, saveDraft]);

  return (
    <Dialog
      {...props}
      fullWidth={true}
      maxWidth="md"
      scroll="paper"
    >
      <DialogTitle>{texts['EDIT_QUESTION']}</DialogTitle>
      <DialogContent classes={{ root: classes.content }}>
        <Box className={classes.selectorsWrapper}>
          <FormControl classes={{ root: classes.formControl }}>
            <InputLabel htmlFor="question-type-select-label">{texts['TYPE']}</InputLabel>
            <Select
              label="question-type-select-label"
              value={questionType}
              onChange={(event) => setQuestionType(event.target.value as QuestionType)}
            >
              {
                ['short_answer', 'fill_in_blank', 'single_choice', 'multiple_choices'].map((type, index) => {
                  return (
                    <MenuItem key={index} value={type}>{texts[`TYPE_${type.toUpperCase()}`]}</MenuItem>
                  );
                })
              }
            </Select>
          </FormControl>
        </Box>
        <Box className={classes.wrapper}>
          <Editor
            editorState={EditorState.createWithContent(defaultContentState)}
            wrapperClass={classes.editorWrapper}
            texts={editorTexts}
            onChange={(data) => {
              setContentState(data.getCurrentContent());
            }}
          />
        </Box>
        {
          (questionType === 'multiple_choices' || questionType === 'single_choice') && (
            <Box>
              <Typography
                variant="h6"
                classes={{ root: classes.choicesTitle }}
              >{texts['CHOICES']}</Typography>
              <DragDropContext onDragEnd={() => {}}>
                <Droppable droppableId="question-choices">
                  {
                    (provided) => {
                      return (
                        <Paper ref={provided.innerRef} elevation={0}>
                          {
                            questionChoices.map((questionChoice, index) => {
                              return (
                                <Draggable key={index} draggableId={`${index}`} index={index + 1}>
                                  {
                                    (provided, snapshot) => {
                                      return (
                                        <Paper
                                          elevation={0}
                                          ref={provided.innerRef}
                                          {...(!showSetAnswer ? provided.draggableProps : {})}
                                          {...(!showSetAnswer ? provided.dragHandleProps : {})}
                                          classes={{
                                            root: clsx(classes.addQuestionChoice, {
                                              [classes.dragging]: snapshot.isDragging,
                                            }),
                                          }}
                                        >
                                          <Paper
                                            elevation={0}
                                            classes={{
                                              root: clsx(classes.addQuestionChoiceInputWrapper, {
                                                [classes.selected]: questionChoice.isAnswer && showSetAnswer,
                                              }),
                                            }}
                                          >
                                            <Box className={classes.addQuestionIndicatorWrapper}>
                                              {
                                                !showSetAnswer
                                                  ? (
                                                    <DragIndicator classes={{ root: classes.addQuestionIcon }} />
                                                  )
                                                  : generateAnswerSelector(questionType, index, questionChoices)
                                              }
                                            </Box>
                                            {
                                              (!showSetAnswer && questionChoice.isAnswer) && (
                                                <Box className={classes.isAnswerTagWrapper}>
                                                  <Chip
                                                    color="primary"
                                                    label={texts['IS_ANSWER']}
                                                    size="small"
                                                    icon={<Check />}
                                                  />
                                                </Box>
                                              )
                                            }
                                            <InputBase
                                              classes={{ root: classes.addQuestionInput }}
                                              placeholder={texts['INPUT_HERE']}
                                              fullWidth={true}
                                              onChange={(event) => handleQuestionChoiceChange(event, index)}
                                            />
                                            <Tooltip title={texts['DELETE']}>
                                              <IconButton
                                                classes={{ root: clsx(classes.deleteButton, 'delete-icon-button') }}
                                                onClick={() => handleDeleteQuestionChoice(index)}
                                              >
                                                <Delete />
                                              </IconButton>
                                            </Tooltip>
                                          </Paper>
                                        </Paper>
                                      );
                                    }
                                  }
                                </Draggable>
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
              {
                questionChoices.length < 10 && (
                  <Button
                    variant="outlined"
                    disabled={!validateChoiceContent(questionChoices)}
                    startIcon={<PlaylistAdd />}
                    classes={{ root: classes.button }}
                    onClick={() => {
                      setQuestionChoices(questionChoices.concat({
                        content: '',
                        order: questionChoices.length + 1,
                        isAnswer: false,
                      }));
                    }}
                  >{texts['CREATE_CHOICE']}</Button>
                )
              }
              {
                showSetAnswer
                  ? (
                    <Button
                      variant="text"
                      color="primary"
                      startIcon={<Close />}
                      onClick={() => setShowSetAnswer(false)}
                    >{texts['CLOSE']}</Button>
                  )
                  : (
                    <Button
                      variant="outlined"
                      classes={{ root: classes.button }}
                      disabled={!validateChoiceCount(questionType, questionChoices)}
                      startIcon={<PlaylistAddCheck />}
                      onClick={() => setShowSetAnswer(true)}
                    >{texts['SELECT_ANSWERS']}</Button>
                  )
              }
            </Box>
          )
        }
      </DialogContent>
      <DialogActions>
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              checked={saveDraft}
              onChange={() => setSaveDraft(!saveDraft)}
            />
          }
          label={systemTexts['SAVE_DRAFT']}
        />
        <Button
          color="primary"
          onClick={() => {
            if (_.isFunction(onClose)) {
              onClose();
            }
          }}
        >{systemTexts['CANCEL']}</Button>
        <Button
          color="primary"
          onClick={() => {
            handleRemoveCache(CACHE_KEYS);
            if (_.isFunction(onSubmitQuestion)) {
              onSubmitQuestion();
            }
          }}
        >{systemTexts['SUBMIT']}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default connect(({ app }: ConnectState) => app)(AppQuestionEditor) as React.FC<AppQuestionEditorProps>;
