import React, { useState } from 'react';
import {
  Editor as DraftEditor,
  EditorState,
  RichUtils,
  DraftBlockType,
  DraftInlineStyleType,
  DraftHandleValue,
  EditorProps as DraftEditorProps,
} from 'draft-js';
import Button from '@material-ui/core/Button';
import Toolbar, { ToolbarProps } from '@material-ui/core/Toolbar';
import _ from 'lodash';
import clsx from 'clsx';
import { Box, BoxProps, makeStyles } from '@material-ui/core';

export type StyleButtonStyle = DraftBlockType | DraftInlineStyleType;
export interface StyleButtonProps {
  style?: StyleButtonStyle;
  active?: boolean;
  label?: string;
  onToggle?: (style: StyleButtonStyle) => void;
}
export interface EditorStyle {
  style: string;
  icon: JSX.Element;
  type: 'block' | 'inline';
}
export type EditorStyleGroup = EditorStyle[];

const StyleButton: React.FC<StyleButtonProps> = ({
  label,
  style,
  active,
  onToggle,
}) => {
  const handleToggle = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.preventDefault();
    if (_.isFunction(onToggle)) {
      onToggle(style);
    }
  };
  return (
    <Button
      className={clsx('editor__control-button', {
        active,
      })}
      onMouseDown={handleToggle}
    >{label}</Button>
  );
};

export interface ControlsProps {
  editorState: EditorState;
  onToggle?: (style: StyleButtonStyle) => void;
}

const BlockStyleControls: React.FC<ControlsProps> = ({
  editorState,
  onToggle,
}) => {
  const BLOCK_TYPES = [
    { label: 'H1', style: 'header-one' },
    { label: 'H2', style: 'header-two' },
    { label: 'H3', style: 'header-three' },
    { label: 'H4', style: 'header-four' },
    { label: 'H5', style: 'header-five' },
    { label: 'H6', style: 'header-six' },
    { label: 'Blockquote', style: 'blockquote' },
    { label: 'UL', style: 'unordered-list-item' },
    { label: 'OL', style: 'ordered-list-item' },
    { label: 'Code Block', style: 'code-block' },
  ];

  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <>
      {
        BLOCK_TYPES.map((type) => {
          return (
            <StyleButton
              key={type.label}
              active={type.style === blockType}
              label={type.label}
              onToggle={onToggle}
              style={type.style}
            />
          );
        })
      }
    </>
  );
};

const InlineStyleControls: React.FC<ControlsProps> = ({
  editorState,
  onToggle,
}) => {
  const currentStyle = editorState.getCurrentInlineStyle();
  const INLINE_STYLES = [
    { label: 'Bold', style: 'BOLD' },
    { label: 'Italic', style: 'ITALIC' },
    { label: 'Underline', style: 'UNDERLINE' },
    { label: 'Monospace', style: 'CODE' },
  ];
  return (
    <>
      {
        INLINE_STYLES.map((type) => {
          return (
            <StyleButton
              key={type.label}
              active={currentStyle.has(type.style)}
              label={type.label}
              onToggle={onToggle}
              style={type.style}
            />
          );
        })
      }
    </>
  );
};

const useStyles = makeStyles((theme) => {
  return {
    controlBar: {
      flexWrap: 'wrap',
    },
    editorContainer: {
      paddingTop: theme.spacing(1.5),
      paddingRight: theme.spacing(3),
      paddingBottom: theme.spacing(1.5),
      paddingLeft: theme.spacing(3),
    },
  };
});

export interface EditorProps {
  toolbarProps?: ToolbarProps;
  containerProps?: BoxProps;
  draftEditorProps?: DraftEditorProps;
  styleTypeGroups?: EditorStyleGroup[];
}

const Editor: React.FC<EditorProps> = ({
  toolbarProps,
  containerProps,
  draftEditorProps,
  styleTypeGroups,
}) => {
  const [
    editorState,
    setEditorState,
  ] = useState<EditorState>(EditorState.createEmpty());
  const classes = useStyles();

  const handleStateChange = (currentEditorState: EditorState) => {
    setEditorState(currentEditorState);
  };

  const handleKeyCommand = (
    command: string,
    editorState: EditorState,
  ): DraftHandleValue => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      handleStateChange(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const toggleBlockType = (blockType: DraftBlockType) => {
    const newState = RichUtils.toggleBlockType(
      editorState,
      blockType,
    );
    handleStateChange(newState);
  };

  const toggleInlineStyle = (inlineStyleType: string) => {
    const newState = RichUtils.toggleInlineStyle(
      editorState,
      inlineStyleType,
    );
    handleStateChange(newState);
  };

  return (
    <>
      <Toolbar classes={{ root: clsx(classes.controlBar) }}>
        <BlockStyleControls
          editorState={editorState}
          onToggle={toggleBlockType}
        />
        <InlineStyleControls
          editorState={editorState}
          onToggle={toggleInlineStyle}
        />
      </Toolbar>
      <Box className={clsx(classes.editorContainer)}>
        <DraftEditor
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          onChange={handleStateChange}
        />
      </Box>
    </>
  );
};

export default Editor;
