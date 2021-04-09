import addLinkPlugin from './plugins/add_link';
import AddLinkPopover from './AddLinkPopover';
import UploadImagePopover from './UploadImagePopover';
import createImagePlugin from './plugins/upload_image';
import createMathPlugin from './plugins/add_math';
import MathPopover from './MathPopover';
import Dropdown from '../Dropdown';
import { uploadImage } from '../../service';
import React, { useEffect, useRef, useState } from 'react';
import DraftEditorUtils, {
  RichUtils,
  DraftBlockType,
  DraftInlineStyleType,
  DraftHandleValue,
  EditorProps as DraftEditorProps,
  AtomicBlockUtils,
  EditorState,
  getDefaultKeyBinding,
} from 'draft-js';
import Divider from '@material-ui/core/Divider';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Toolbar, { ToolbarProps } from '@material-ui/core/Toolbar';
import _ from 'lodash';
import clsx from 'clsx';
import Box, { BoxProps } from '@material-ui/core/Box';
import { makeStyles, SvgIconTypeMap } from '@material-ui/core';
import FormatQuote from '@material-ui/icons/FormatQuote';
import FormatListBulleted from '@material-ui/icons/FormatListBulleted';
import FormatListNumbered from '@material-ui/icons/FormatListNumbered';
import Check from '@material-ui/icons/Check';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Code from '@material-ui/icons/Code';
import CodeJson from 'mdi-material-ui/CodeJson';
import StrikethroughS from '@material-ui/icons/StrikethroughS';
import Link from '@material-ui/icons/Link';
import Image from '@material-ui/icons/Image';
import Undo from '@material-ui/icons/Undo';
import Redo from '@material-ui/icons/Redo';
import Functions from '@material-ui/icons/Functions';
import FormatBold from 'mdi-material-ui/FormatBold';
import FormatItalic from 'mdi-material-ui/FormatItalic';
import FormatUnderline from 'mdi-material-ui/FormatUnderline';
import DraftEditor, { composeDecorators } from '@draft-js-plugins/editor';
import createResizeablePlugin from '@draft-js-plugins/resizeable';
import createFocusPlugin from '@draft-js-plugins/focus';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';
import './index.less';

const mathPlugin = createMathPlugin();
const focusPlugin = createFocusPlugin();
const resizeablePlugin = createResizeablePlugin({
  vertical: 'relative',
  horizontal: 'relative',
});
const decorator = composeDecorators(
  resizeablePlugin.decorator,
  focusPlugin.decorator,
);
const readonlyDecorator = composeDecorators(resizeablePlugin.decorator);
const resizableImagePlugin = createImagePlugin({ decorator });
const imagePlugin = createImagePlugin({ decorator: readonlyDecorator });

export type StyleButtonStyle = DraftBlockType | DraftInlineStyleType;
export interface StyleButtonProps {
  style?: StyleButtonStyle;
  active?: boolean;
  label?: string;
  texts?: Record<string, string>;
  Icon?: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
  onToggle?: (style: StyleButtonStyle) => void;
}
export interface EditorStyle {
  style: string;
  icon: JSX.Element;
  type: 'block' | 'inline';
}
export type EditorStyleGroup = EditorStyle[];

const useStyleButtonStyles = makeStyles((theme) => {
  return {
    active: {
      color: theme.palette.primary.main,
    },
  };
});

const StyleButton: React.FC<StyleButtonProps> = ({
  label,
  style,
  active,
  Icon,
  onToggle,
}) => {
  const classes = useStyleButtonStyles();

  const handleToggle = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.preventDefault();
    if (_.isFunction(onToggle)) {
      onToggle(style);
    }
  };

  if (!Icon) {
    return null;
  }

  return (
    <Tooltip title={label}>
      <IconButton
        className={clsx('editor__control-button', {
          [classes.active]: active,
        })}
        onMouseDown={handleToggle}
      >
        <Icon />
      </IconButton>
    </Tooltip>
  );
};

const useHeadingSelectorStyles = makeStyles((theme) => {
  return {
    item: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    activeItem: {
      color: theme.palette.primary.main,
    },
    button: {
      textTransform: 'none',
      maxWidth: 120,
    },
    buttonLabel: {
      justifyContent: 'flex-start',
    },
  };
});

const HeadingSelector: React.FC<ControlsProps> = ({
  editorState,
  texts = {},
  onToggle,
}) => {
  const VARIANTS = ['one', 'two', 'three', 'four', 'five', 'six'];

  const [blockType, setBlockType] = useState<DraftBlockType>(undefined);
  const classes = useHeadingSelectorStyles();

  useEffect(() => {
    const selection = editorState.getSelection();
    const blockType = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();
    if (!VARIANTS.map((variant) => `header-${variant}`).includes(blockType)) {
      setBlockType('unstyled');
    } else {
      setBlockType(blockType);
    }
  }, [editorState]);

  return (
    <Dropdown
      trigger={
        <Button
          classes={{
            root: clsx(classes.button),
            label: clsx(classes.buttonLabel),
          }}
        >
          <Typography noWrap={true}>
            {
              blockType === 'unstyled'
                ? texts['header-paragraph']
                : texts[blockType]
            }
          </Typography>
        </Button>
      }
      closeOnClickBody={true}
    >
      {
        ['paragraph']
          .concat(VARIANTS)
          .map((variant) => `header-${variant}`)
          .map((variant, index) => {
            const isActive = blockType === variant
              || (
                blockType === 'unstyled'
                && variant === 'header-paragraph'
              );
            return (
              <div
                key={index}
                onClick={() => {
                  if (_.isFunction(onToggle)) {
                    onToggle(variant === 'header-paragraph'
                      ? 'unstyled'
                      : variant);
                  }
                }}
              >
                <MenuItem
                  classes={{
                    root: clsx(classes.item, {
                      [classes.activeItem]: isActive,
                    }),
                  }}
                >
                  <Typography>{texts[variant]}</Typography>
                  <Box>
                    {
                      isActive && (
                        <Check color="primary" fontSize="small" />
                      )
                    }
                  </Box>
                </MenuItem>
              </div>
            );
          })
      }
    </Dropdown>
  );
};

export interface ControlsProps {
  editorState: EditorState;
  texts?: Record<string, string>;
  onToggle?: (style: StyleButtonStyle) => void;
}

const BlockStyleControls: React.FC<ControlsProps> = ({
  editorState,
  texts = {},
  onToggle,
}) => {
  const BLOCK_TYPES = [
    {
      label: texts['blockquote'],
      style: 'blockquote',
      Icon: FormatQuote,
    },
    {
      label: texts['unordered-list-item'],
      style: 'unordered-list-item',
      Icon: FormatListBulleted,
    },
    {
      label: texts['ordered-list-item'],
      style: 'ordered-list-item',
      Icon: FormatListNumbered,
    },
    {
      label: texts['code-block'],
      style: 'code-block',
      Icon: Code,
    },
  ];

  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <>
      {
        BLOCK_TYPES.map((type, index) => {
          return (
            <StyleButton
              key={index}
              active={type.style === blockType}
              label={type.label}
              style={type.style}
              Icon={type.Icon}
              onToggle={onToggle}
            />
          );
        })
      }
    </>
  );
};

const InlineStyleControls: React.FC<ControlsProps> = ({
  editorState,
  texts,
  onToggle,
}) => {
  const currentStyle = editorState.getCurrentInlineStyle();
  const INLINE_STYLES = [
    { label: texts['BOLD'], style: 'BOLD', Icon: FormatBold },
    { label: texts['ITALIC'], style: 'ITALIC', Icon: FormatItalic },
    { label: texts['UNDERLINE'], style: 'UNDERLINE', Icon: FormatUnderline },
    { label: texts['STRIKETHROUGH'], style: 'STRIKETHROUGH', Icon: StrikethroughS },
    { label: texts['CODE'], style: 'CODE', Icon: CodeJson },
  ];
  return (
    <>
      {
        INLINE_STYLES.map((type, index) => {
          return (
            <StyleButton
              key={index}
              active={currentStyle.has(type.style)}
              label={type.label}
              style={type.style}
              Icon={type.Icon}
              onToggle={onToggle}
            />
          );
        })
      }
    </>
  );
};

const useEditorStyles = makeStyles((theme) => {
  return {
    controlBar: {
      flexWrap: 'nowrap',
      overflowX: 'scroll',
    },
    editorContainer: {
      paddingTop: theme.spacing(1.5),
      paddingRight: theme.spacing(3),
      paddingBottom: theme.spacing(3),
      paddingLeft: theme.spacing(3),
      overflowY: 'scroll',
    },
    divider: {
      marginRight: theme.spacing(3),
      marginLeft: theme.spacing(3),
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
    },
    popover: {
      minWidth: 320,
      maxWidth: 480,
      padding: theme.spacing(2),
    },
  };
});

export interface EditorProps {
  toolbarProps?: ToolbarProps;
  containerProps?: BoxProps;
  draftEditorProps?: DraftEditorProps;
  styleTypeGroups?: EditorStyleGroup[];
  texts?: Record<string, string>;
  readonly?: boolean;
  editorState?: EditorState;
  wrapperClass?: string;
  onChange?(state: EditorState): void;
}

const Editor: React.FC<EditorProps> = ({
  texts = {},
  readonly = false,
  editorState: defaultEditorState,
  wrapperClass,
  onChange,
}) => {
  const [
    editorState,
    setEditorState,
  ] = useState<EditorState>(defaultEditorState || EditorState.createEmpty());
  const classes = useEditorStyles();
  const [editorTexts, setEditorTexts] = useState <Record<string, string>>({
    'header-one': 'Heading 1',
    'header-two': 'Heading 2',
    'header-three': 'Heading 3',
    'header-four': 'Heading 4',
    'header-five': 'Heading 5',
    'header-six': 'Heading 6',
    'header-paragraph': 'Paragraph',
    'blockquote': 'Block Quote',
    'unordered-list-item': 'Unordered List Item',
    'ordered-list-item': 'Ordered List Item',
    'code-block': 'Code Block',
    'BOLD': 'Bold',
    'ITALIC': 'Italic',
    'UNDERLINE': 'Underline',
    'CODE': 'Inline Code',
    'STRIKETHROUGH': 'Strike Through',
    'CANCEL': 'Cancel',
    'OK': 'OK',
    'CLICK_TO_UPLOAD': 'Click here to upload image',
    'IMAGE_UPLOADING': 'Image uploading...',
    'EQUATION_CONTENT': 'Math equation content',
    'USE_BLOCK_EQUATION': 'Blocked equation',
    'ADD_LINK': 'Add link',
    'UPLOAD_IMAGE': 'Upload image',
    'FUNCTIONS': 'Math equation',
    'UNDO': 'Undo',
    'REDO': 'Redo',
  });
  const ref = useRef(null);
  const [addLinkAnchor, setAddLinkAnchor] = useState<HTMLElement | null>(null);
  const addLinkButton = useRef(null);
  const [uploadImageAnchor, setUploadImageAnchor] = useState<HTMLElement | null>(null);
  const uploadImageButton = useRef(null);
  const [addMathAnchor, setAddMathAnchor] = useState<HTMLElement | null>(null);
  const addMathButton = useRef(null);
  const editorContainerBottom = useRef<HTMLDivElement>(null);

  const VerticalDivider = () => (
    <Divider
      orientation="vertical"
      flexItem={true}
      classes={{
        root: classes.divider,
      }}
    />
  );

  useEffect(() => {
    setEditorTexts(_.merge(editorTexts, texts));
  }, [texts]);

  useEffect(() => {
    if (_.isFunction(onChange)) {
      onChange(editorState);
    }
  }, [editorState]);

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

  const keyBindingFn = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.keyCode === 13) {
      const selectionState = editorState.getSelection();
      const selectionEndBlock = selectionState.getEndKey();
      const contentEndKey = _.last(DraftEditorUtils.convertToRaw(editorState.getCurrentContent()).blocks).key;
      if (selectionEndBlock && contentEndKey && editorContainerBottom?.current) {
        editorContainerBottom?.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
    return getDefaultKeyBinding(event);
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
      <AddLinkPopover
        anchor={addLinkAnchor}
        texts={editorTexts}
        onSubmit={(url) => {
          setAddLinkAnchor(null);
          const selection = editorState.getSelection();
          if (!url) {
            handleStateChange(RichUtils.toggleLink(editorState, selection, null));
          }
          const content = editorState.getCurrentContent();
          const contentWithEntity = content.createEntity('LINK', 'MUTABLE', {
            url,
          });
          const newEditorState = EditorState.push(
            editorState,
            contentWithEntity,
            'apply-entity',
          );
          const entityKey = contentWithEntity.getLastCreatedEntityKey();
          handleStateChange(RichUtils.toggleLink(newEditorState, selection, entityKey));
        }}
      />
      <UploadImagePopover
        anchor={uploadImageAnchor}
        texts={editorTexts}
        onSubmit={(data, notCancelled) => {
          setUploadImageAnchor(null);
          if (data.file && notCancelled) {
            uploadImage(data.file).then((url) => {
              if (url) {
                const contentState = editorState.getCurrentContent();
                const contentStateWithEntity = contentState.createEntity(
                  'IMAGE',
                  'IMMUTABLE',
                  { src: url, width: 32 },
                );
                const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
                const newEditorState = EditorState.set(
                  editorState,
                  { currentContent: contentStateWithEntity },
                );
                handleStateChange(AtomicBlockUtils.insertAtomicBlock(
                  newEditorState,
                  entityKey,
                  ' ',
                ));
              }
            });
          }
        }}
      />
      <MathPopover
        anchor={addMathAnchor}
        texts={editorTexts}
        onSubmit={(data, notCancelled) => {
          setAddMathAnchor(null);
          if (data.content && notCancelled) {
            const contentState = editorState.getCurrentContent();
            const contentStateWithEntity = contentState.createEntity(
              'MATH',
              'IMMUTABLE',
              { content: data.content },
            );
            const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
            const newEditorState = EditorState.set(
              editorState,
              { currentContent: contentStateWithEntity },
            );
            handleStateChange(AtomicBlockUtils.insertAtomicBlock(
              newEditorState,
              entityKey,
              ' ',
            ));
          }
        }}
      />
      {
        !readonly && (
          <>
            <Toolbar classes={{ root: clsx(classes.controlBar) }}>
              {
                editorState.getUndoStack().toArray().length === 0
                  ? (
                    <IconButton disabled={true}>
                      <Undo />
                    </IconButton>
                  )
                  : (
                    <Tooltip title={editorTexts['UNDO']}>
                      <IconButton
                        onClick={() => {
                          handleStateChange(EditorState.undo(editorState));
                        }}
                      >
                        <Undo />
                      </IconButton>
                    </Tooltip>
                  )
              }
              {
                editorState.getRedoStack().toArray().length === 0
                  ? (
                    <IconButton disabled={true}>
                      <Redo />
                    </IconButton>
                  )
                  : (
                    <Tooltip title={editorTexts['REDO']}>
                      <IconButton
                        onClick={() => {
                          handleStateChange(EditorState.redo(editorState));
                        }}
                      >
                        <Redo />
                      </IconButton>
                    </Tooltip>
                  )
              }
              <VerticalDivider />
              <HeadingSelector
                editorState={editorState}
                texts={editorTexts}
                onToggle={toggleBlockType}
              />
              <InlineStyleControls
                editorState={editorState}
                texts={editorTexts}
                onToggle={toggleInlineStyle}
              />
              <VerticalDivider />
              <BlockStyleControls
                editorState={editorState}
                texts={editorTexts}
                onToggle={toggleBlockType}
              />
              <VerticalDivider />
              <Tooltip title={editorTexts['ADD_LINK']}>
                <IconButton
                  ref={addLinkButton}
                  onClick={() => {
                    setAddLinkAnchor(addLinkButton?.current);
                  }}
                >
                  <Link />
                </IconButton>
              </Tooltip>
              <Tooltip title={editorTexts['UPLOAD_IMAGE']}>
                <IconButton
                  ref={uploadImageButton}
                  onClick={() => {
                    setUploadImageAnchor(uploadImageButton?.current);
                  }}
                >
                  <Image />
                </IconButton>
              </Tooltip>
              <Tooltip title={editorTexts['FUNCTIONS']}>
                <IconButton
                  ref={addMathButton}
                  onClick={() => {
                    setAddMathAnchor(addMathButton?.current);
                  }}
                >
                  <Functions />
                </IconButton>
              </Tooltip>
            </Toolbar>
            <Divider />
          </>
        )
      }
      <Paper
        elevation={0}
        className={clsx(classes.editorContainer, {
          [wrapperClass]: wrapperClass,
        })}
      >
        <DraftEditor
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          plugins={[
            resizeablePlugin,
            ...(
              readonly
                ? [
                  imagePlugin,
                ]
                : [
                  focusPlugin,
                  resizableImagePlugin,
                ]
            ),
            addLinkPlugin,
            mathPlugin,
          ]}
          ref={ref}
          readOnly={readonly}
          keyBindingFn={keyBindingFn}
          onChange={handleStateChange}
        />
        <div ref={editorContainerBottom}></div>
      </Paper>
    </>
  );
};

export default Editor;
