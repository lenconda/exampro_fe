import { createCategories, createQuestion, getAllCategoriesWithoutPagination, updateQuestion } from './service';
import { Dispatch, QuestionCategory, QuestionChoice, QuestionType } from '../../interfaces';
import { AppState } from '../../models/app';
import Editor from '../Editor';
import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import { useTexts } from '../../utils/texts';
import { useDebouncedValue, useUpdateEffect } from '../../utils/hooks';
import { useRequest } from '../../utils/request';
import AutoComplete from '@material-ui/lab/Autocomplete';
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
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
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
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import clsx from 'clsx';

export type QuestionChoiceWithAnswer = QuestionChoice & {
  isAnswer: boolean;
};

export interface AppQuestionMetaData {
  type: QuestionType;
  id?: number;
  content?: ContentState;
  choices?: QuestionChoice[];
  answer?: string[] | ContentState;
  categories?: QuestionCategory[];
  blankCount?: number;
}

export interface AppQuestionEditorProps extends DialogProps {
  mode?: 'create' | 'edit';
  question?: AppQuestionMetaData;
  onSubmitQuestion?(questionMetaData: AppQuestionMetaData): void;
}
export interface AppQuestionEditorConnectedProps extends Dispatch, AppState, AppQuestionEditorProps {}

export const CACHE_KEYS = {
  SAVE_DRAFT: 'saveQuestionDraft',
  QUESTION_CONTENT: 'questionContent',
  QUESTION_TYPE: 'questionType',
  QUESTION_SHORT_ANSWER_CONTENT: 'questionShortAnswerContent',
  QUESTION_CHOICES: 'questionChoices',
  QUESTION_BLANK_ANSWERS: 'questionBlankAnswers',
  QUESTION_CATEGORIES: 'questionCategories',
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
    questionCategorySelector: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    title: {
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
    inputBase: {
      paddingTop: theme.spacing(1),
      paddingRight: theme.spacing(2),
      paddingBottom: theme.spacing(1),
      paddingLeft: theme.spacing(0.5),
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
    blankAnswerWrapper: {
      padding: theme.spacing(0.5),
      display: 'flex',
      flexDirection: 'row',
      '&:hover .delete-icon-button': {
        display: 'block',
      },
    },
    blankAnswerIndexIndicatorWrapper: {
      width: theme.spacing(5),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
      flexGrow: 0,
    },
  };
});

const reorderQuestionChoices = (
  list: Partial<QuestionChoiceWithAnswer>[],
  startIndex: number,
  endIndex: number,
): Partial<QuestionChoiceWithAnswer>[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex - 1, 1);
  result.splice(endIndex - 1, 0, removed);
  return result;
};

const AppQuestionEditor: React.FC<AppQuestionEditorConnectedProps> = ({
  mode = 'create',
  question,
  dispatch,
  onClose,
  onSubmitQuestion,
  ...props
}) => {
  if (!question) { return null }
  const texts = useTexts(dispatch, 'questionEditor');
  const editorTexts = useTexts(dispatch, 'editor');
  const systemTexts = useTexts(dispatch, 'system');
  const classes = useStyles();
  const [showSetAnswer, setShowSetAnswer] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [
    questionContentState,
    setQuestionContentState,
  ] = useState<ContentState>(EditorState.createEmpty().getCurrentContent());
  const [
    saveDraft,
    setSaveDraft,
  ] = useState<boolean>(JSON.parse(localStorage.getItem(CACHE_KEYS.SAVE_DRAFT) || 'false'));
  const [
    questionType,
    setQuestionType,
  ] = useState<QuestionType>(localStorage.getItem(CACHE_KEYS.QUESTION_TYPE) as QuestionType || 'short_answer');
  const [questionChoices, setQuestionChoices] = useState<Partial<QuestionChoiceWithAnswer>[]>([]);
  const [questionBlankAnswers, setQuestionBlankAnswers] = useState<string[]>([]);
  const [
    questionShortAnswerContentState,
    setQuestionShortAnswerContentState,
  ] = useState<ContentState>(EditorState.createEmpty().getCurrentContent());
  const [
    questionCategories = [],
    questionCategoriesLoading,
  ] = useRequest<QuestionCategory[]>(getAllCategoriesWithoutPagination);
  const [
    selectedQuestionCategories,
    setSelectedQuestionCategories,
  ] = useState<(QuestionCategory | string)[]>([]);

  const debouncedQuestionContentState = useDebouncedValue<ContentState>(questionContentState);
  const debouncedQuestionShortAnswerContentState = useDebouncedValue<ContentState>(questionShortAnswerContentState);

  const validateChoiceContent = (choices: Partial<QuestionChoiceWithAnswer>[]) => {
    for (const choice of choices) {
      if (!choice.content) {
        return false;
      }
    }
    return true;
  };

  const validateBlankAnswerContent = (answers: string[]) => {
    for (const answer of answers) {
      if (!answer) {
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

  const validateChoiceAnswerCount = (type: QuestionType, choices: Partial<QuestionChoiceWithAnswer>[]) => {
    const answerLength = choices.filter((choice) => choice.isAnswer).length;
    if (type === 'multiple_choices') {
      return answerLength >= 2;
    } else if (type === 'single_choice') {
      return answerLength === 1;
    } else {
      return false;
    }
  };

  const validateContent = (content: ContentState) => {
    return content.hasText();
  };

  const validateSubmit = (
    type: QuestionType,
    content: ContentState,
    answer: ContentState,
    answers: string[],
    choices: Partial<QuestionChoiceWithAnswer>[],
  ) => {
    const contentValidation = validateContent(content);
    const choiceValidation = validateChoiceContent(choices) && validateChoiceCount(type, choices);
    const fillInBlankValidation = validateBlankAnswerContent(answers);
    const shortAnswerValidation = validateContent(answer);
    const choiceAnswerCountValidation = validateChoiceAnswerCount(type, choices);

    switch (type) {
    case 'single_choice': {
      return contentValidation && choiceValidation && choiceAnswerCountValidation;
    }
    case 'multiple_choices': {
      return contentValidation && choiceValidation && choiceAnswerCountValidation;
    }
    case 'fill_in_blank': {
      return contentValidation && fillInBlankValidation;
    }
    case 'short_answer': {
      return contentValidation && shortAnswerValidation;
    }
    default:
      return false;
    }
  };

  const getQuestionAnswer = (): string[] | ContentState => {
    switch (questionType) {
    case 'single_choice': {
      const answerIndex = questionChoices.findIndex((choice) => choice.isAnswer);
      return [(answerIndex + 1).toString()];
    }
    case 'multiple_choices': {
      return questionChoices
        .filter((choice) => choice.isAnswer)
        .map((choice, index) => (index + 1).toString());
    }
    case 'fill_in_blank': {
      return questionBlankAnswers;
    }
    case 'short_answer': {
      return questionShortAnswerContentState;
    }
    default:
      return null;
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination || !source) {
      return;
    }
    const currentQuestionChoices = reorderQuestionChoices(Array.from(questionChoices), source.index, destination.index);
    setQuestionChoices(currentQuestionChoices.map((choice, index) => {
      return {
        ...choice,
        order: index + 1,
      };
    }));
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

  const handleBlankAnswerChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    index: number,
  ) => {
    setQuestionBlankAnswers(questionBlankAnswers.map((answer, currentIndex) => {
      if (currentIndex === index) {
        return event.target.value;
      }
      return answer;
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

  const handleDeleteQuestionBlankAnswer = (index: number) => {
    setQuestionBlankAnswers(questionBlankAnswers.filter((answer, currentIndex) => {
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
    setQuestionChoices(questionChoices.map((choice) => {
      return {
        ...choice,
        isAnswer: false,
      };
    }));
  }, [questionType]);

  useUpdateEffect(() => {
    if (saveDraft) {
      let questionContentStateString
        = JSON.stringify(DraftEditor.convertToRaw(EditorState.createEmpty().getCurrentContent()));
      let questionShortAnswerContentStateString
        = JSON.stringify(DraftEditor.convertToRaw(EditorState.createEmpty().getCurrentContent()));

      if (debouncedQuestionContentState) {
        questionContentStateString = JSON.stringify(DraftEditor.convertToRaw(debouncedQuestionContentState));
      }

      if (debouncedQuestionShortAnswerContentState) {
        questionShortAnswerContentStateString = JSON.stringify(DraftEditor.convertToRaw(debouncedQuestionShortAnswerContentState));
      }

      localStorage.setItem(CACHE_KEYS.SAVE_DRAFT, JSON.stringify(true));
      localStorage.setItem(CACHE_KEYS.QUESTION_CONTENT, questionContentStateString);
      localStorage.setItem(CACHE_KEYS.QUESTION_TYPE, questionType);
      localStorage.setItem(CACHE_KEYS.QUESTION_SHORT_ANSWER_CONTENT, questionShortAnswerContentStateString);
      localStorage.setItem(CACHE_KEYS.QUESTION_CATEGORIES, JSON.stringify(selectedQuestionCategories));
      if (questionChoices.length !== 0) {
        localStorage.setItem(CACHE_KEYS.QUESTION_CHOICES, JSON.stringify(questionChoices));
      }
      if (questionBlankAnswers.length !== 0) {
        localStorage.setItem(CACHE_KEYS.QUESTION_BLANK_ANSWERS, JSON.stringify(questionBlankAnswers));
      }
    } else {
      handleRemoveCache(CACHE_KEYS);
    }
  }, [
    debouncedQuestionContentState,
    debouncedQuestionShortAnswerContentState,
    questionType,
    questionChoices,
    questionBlankAnswers,
    selectedQuestionCategories,
    saveDraft,
  ]);

  useEffect(() => {
    if (mode === 'create') {
      if (saveDraft) {
        const cachedQuestionContentState = localStorage.getItem(CACHE_KEYS.QUESTION_CONTENT);
        const cachedShortAnswerContentState = localStorage.getItem(CACHE_KEYS.QUESTION_SHORT_ANSWER_CONTENT);
        const cachedQuestionChoices = localStorage.getItem(CACHE_KEYS.QUESTION_CHOICES) || '[]';
        const cachedQuestionBlankAnswers = localStorage.getItem(CACHE_KEYS.QUESTION_BLANK_ANSWERS) || '[]';
        const cachedQuestionCategories = localStorage.getItem(CACHE_KEYS.QUESTION_CATEGORIES) || '[]';

        setQuestionContentState(cachedQuestionContentState
          ? DraftEditor.convertFromRaw(JSON.parse(cachedQuestionContentState))
          : EditorState.createEmpty().getCurrentContent());

        setQuestionShortAnswerContentState(cachedShortAnswerContentState
          ? DraftEditor.convertFromRaw(JSON.parse(cachedShortAnswerContentState))
          : EditorState.createEmpty().getCurrentContent());

        setQuestionChoices(JSON.parse(cachedQuestionChoices));
        setQuestionBlankAnswers(JSON.parse(cachedQuestionBlankAnswers));
        setSelectedQuestionCategories(JSON.parse(cachedQuestionCategories));
      }
    } else if (mode === 'edit') {
      const {
        type = 'single_choice',
        answer = [],
        content = EditorState.createEmpty().getCurrentContent(),
        choices = [],
        categories = [],
      } = question || {};
      setQuestionType(type);
      setQuestionContentState(content);
      setSelectedQuestionCategories(categories);
      switch (type) {
      case 'single_choice': {
        const currentAnswer = _.first((answer || []) as string[]);
        setQuestionChoices(choices.map((choice, index) => {
          return {
            ...choice,
            isAnswer: currentAnswer === (index + 1).toString(),
          };
        }));
        break;
      }
      case 'multiple_choices': {
        const currentAnswers = (answer || []) as string[];
        setQuestionChoices(choices.map((choice, index) => {
          return {
            ...choice,
            isAnswer: currentAnswers.indexOf((index + 1).toString()) !== -1,
          };
        }));
        break;
      }
      case 'fill_in_blank': {
        setQuestionBlankAnswers(answer as string[]);
        break;
      }
      case 'short_answer': {
        if (answer instanceof ContentState) {
          setQuestionShortAnswerContentState(answer);
        }
        break;
      }
      default:
        break;
      }
    }
  }, [mode, saveDraft, question]);

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
        <Typography
          variant="subtitle2"
          classes={{ root: classes.title }}
        >{texts['QUESTION_CONTENT']}</Typography>
        <Box className={classes.wrapper}>
          <Editor
            editorState={EditorState.createWithContent(questionContentState)}
            wrapperClass={classes.editorWrapper}
            texts={editorTexts}
            onChange={(data) => {
              setQuestionContentState(data.getCurrentContent());
            }}
          />
        </Box>
        {
          (questionType === 'multiple_choices' || questionType === 'single_choice') && (
            <Box>
              <Typography
                variant="subtitle2"
                classes={{ root: classes.title }}
              >{texts['CHOICES']}</Typography>
              <DragDropContext onDragEnd={handleDragEnd}>
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
                                                    variant="outlined"
                                                    color="primary"
                                                    label={texts['IS_ANSWER']}
                                                    size="small"
                                                    icon={<Check />}
                                                  />
                                                </Box>
                                              )
                                            }
                                            <InputBase
                                              classes={{ root: classes.inputBase }}
                                              placeholder={texts['INPUT_HERE']}
                                              fullWidth={true}
                                              value={questionChoice.content}
                                              onChange={(event) => handleQuestionChoiceChange(event, index)}
                                            />
                                            <Tooltip title={texts['DELETE_CHOICE']}>
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
        {
          questionType === 'fill_in_blank' && (
            <Box>
              <Typography
                variant="subtitle2"
                classes={{ root: classes.title }}
              >{texts['SELECT_ANSWERS']}</Typography>
              <Paper elevation={0}>
                {
                  questionBlankAnswers.map((answer, index) => {
                    return (
                      <Paper
                        key={index}
                        elevation={0}
                        classes={{ root: classes.blankAnswerWrapper }}
                      >
                        <Box
                          className={classes.blankAnswerIndexIndicatorWrapper}
                        >{index + 1}.</Box>
                        <InputBase
                          fullWidth={true}
                          classes={{ root: classes.inputBase }}
                          value={answer}
                          onChange={(event) => handleBlankAnswerChange(event, index)}
                        />
                        <Tooltip title={texts['DELETE_ANSWER']}>
                          <IconButton
                            classes={{
                              root: clsx(classes.deleteButton, 'delete-icon-button'),
                            }}
                            onClick={() => handleDeleteQuestionBlankAnswer(index)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Paper>
                    );
                  })
                }
              </Paper>
              <Button
                disabled={!validateBlankAnswerContent(questionBlankAnswers)}
                variant="outlined"
                startIcon={<PlaylistAdd />}
                onClick={() => {
                  setQuestionBlankAnswers(questionBlankAnswers.concat(['']));
                }}
              >{texts['ADD_BLANK_ANSWER']}</Button>
            </Box>
          )
        }
        {
          questionType === 'short_answer' && (
            <Box>
              <Typography
                variant="subtitle2"
                classes={{ root: classes.title }}
              >{texts['SELECT_ANSWERS']}</Typography>
              <Box className={classes.wrapper}>
                <Editor
                  editorState={EditorState.createWithContent(questionShortAnswerContentState)}
                  wrapperClass={classes.editorWrapper}
                  texts={editorTexts}
                  onChange={(data) => {
                    setQuestionShortAnswerContentState(data.getCurrentContent());
                  }}
                />
              </Box>
            </Box>
          )
        }
        <AutoComplete
          id="question-tags"
          multiple={true}
          freeSolo={true}
          filterSelectedOptions={true}
          limitTags={5}
          value={selectedQuestionCategories}
          loading={questionCategoriesLoading}
          options={questionCategories}
          loadingText={systemTexts['LOADING']}
          getOptionSelected={(option, value) => {
            if (typeof option === 'string') {
              return option === value;
            } else {
              return (option as QuestionCategory).name === (value as QuestionCategory).name;
            }
          }}
          getOptionLabel={(category) => (typeof category === 'string' ? category : category.name)}
          renderInput={(autoCompleteProps) => {
            return (
              <TextField
                {...autoCompleteProps}
                classes={{ root: classes.questionCategorySelector }}
                label={texts['QUESTION_CATEGORY']}
              />
            );
          }}
          onChange={(event, data) => {
            setSelectedQuestionCategories(data);
          }}
        />
      </DialogContent>
      <DialogActions>
        {
          mode === 'create' && (
            <FormControlLabel
              disabled={submitting}
              control={
                <Checkbox
                  color="primary"
                  checked={saveDraft}
                  onChange={() => setSaveDraft(!saveDraft)}
                />
              }
              label={systemTexts['SAVE_DRAFT']}
            />
          )
        }
        <Button
          color="primary"
          disabled={submitting}
          onClick={() => {
            if (mode === 'create') {
              handleRemoveCache(CACHE_KEYS);
            }
            if (_.isFunction(onClose)) {
              onClose();
            }
          }}
        >{systemTexts['CANCEL']}</Button>
        <Button
          color="primary"
          disabled={
            submitting
            || !validateSubmit(
              questionType,
              questionContentState,
              questionShortAnswerContentState,
              questionBlankAnswers,
              questionChoices,
            )
          }
          onClick={() => {
            if (mode === 'create') {
              handleRemoveCache(CACHE_KEYS);
            }
            setSubmitting(true);
            const answer = getQuestionAnswer();
            const choices = questionChoices.map((choice) => _.omit(choice, 'isAnswer')) as QuestionChoice[];
            const request = mode === 'create'
              ? createQuestion(questionContentState, questionType, selectedQuestionCategories, {
                answer,
                choices,
              })
              : updateQuestion(question.id, questionContentState, questionType, selectedQuestionCategories, {
                answer,
                choices,
              });
            request.finally(() => {
              setSubmitting(false);
              if (_.isFunction(onSubmitQuestion)) {
                onSubmitQuestion({
                  type: questionType,
                  content: questionContentState,
                  choices: questionChoices,
                  answer: getQuestionAnswer(),
                } as AppQuestionMetaData);
              }
            });
          }}
        >{submitting ? systemTexts['SUBMITTING'] : systemTexts['SUBMIT']}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default connect(({ app }: ConnectState) => app)(AppQuestionEditor) as React.FC<AppQuestionEditorProps>;
