import { Dispatch, Question, QuestionType } from '../../interfaces';
import { AppState } from '../../models/app';
import Editor from '../Editor';
import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import { useTexts } from '../../utils/texts';
import { useDebouncedValue, useUpdateEffect } from '../../utils/hooks';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import React, { useState } from 'react';
import { FormGroup, makeStyles } from '@material-ui/core';
import DraftEditor, { ContentState, EditorState } from 'draft-js';
import _ from 'lodash';

export interface AppQuestionEditorProps extends DialogProps {
  onSubmitQuestion?(question: Question): void;
}
export interface AppQuestionEditorConnectedProps extends Dispatch, AppState, AppQuestionEditorProps {}

const useStyles = makeStyles((theme) => {
  return {
    wrapper: {
      borderWidth: 1,
      borderColor: theme.palette.grey[300],
      borderStyle: 'solid',
    },
    content: {
    },
    editorWrapper: {
      height: 240,
      overflowY: 'scroll',
    },
    questionTypeWrapper: {
      width: '100%',
      marginBottom: theme.spacing(2),
    },
  };
});

const AppQuestionEditor: React.FC<AppQuestionEditorConnectedProps> = ({
  dispatch,
  onClose,
  ...props
}) => {
  const texts = useTexts(dispatch, 'questionEditor');
  const editorTexts = useTexts(dispatch, 'editor');
  const systemTexts = useTexts(dispatch, 'system');
  const classes = useStyles();
  const [contentState, setContentState] = useState<ContentState>(null);
  const debouncedContentState = useDebouncedValue<ContentState>(contentState);

  const [questionType, setQuestionType] = useState<QuestionType>('short_answer');

  const defaultEditorStateString = localStorage.getItem('questionContent');
  const defaultEditorState = defaultEditorStateString
    ? DraftEditor.convertFromRaw(JSON.parse(defaultEditorStateString))
    : null;

  useUpdateEffect(() => {
    let contentStateString = JSON.stringify(DraftEditor.convertToRaw(EditorState.createEmpty().getCurrentContent()));
    if (debouncedContentState) {
      contentStateString = JSON.stringify(DraftEditor.convertToRaw(debouncedContentState));
    }
    localStorage.setItem('questionContent', contentStateString);
  }, [debouncedContentState]);

  return (
    <Dialog
      {...props}
      fullWidth={true}
      maxWidth="md"
    >
      <DialogTitle>{texts['EDIT_QUESTION']}</DialogTitle>
      <DialogContent classes={{ root: classes.content }}>
        <Box className={classes.questionTypeWrapper}>
          <Select
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
        </Box>
        <Box className={classes.wrapper}>
          <Editor
            editorState={defaultEditorState ? EditorState.createWithContent(defaultEditorState) : null}
            wrapperClass={classes.editorWrapper}
            texts={editorTexts}
            onChange={(data) => {
              setContentState(data.getCurrentContent());
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
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
            if (_.isFunction(onClose)) {
              onClose();
            }
          }}
        >{systemTexts['SUBMIT']}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default connect(({ app }: ConnectState) => app)(AppQuestionEditor) as React.FC<AppQuestionEditorProps>;
