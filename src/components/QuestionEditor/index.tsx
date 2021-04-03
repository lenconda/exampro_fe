import UploadImagePopover from './UploadImage';
import { AppState } from '../../models/app';
import { ConnectState } from '../../models';
import { connect } from '../../patches/dva';
import { Dispatch } from '../../interfaces';
import { useTexts } from '../../utils/texts';
import { uploadImage as uploadImageToServer } from '../../service';
import { makeStyles } from '@material-ui/core';
import Image from '@material-ui/icons/Image';
import React, { useRef, useState } from 'react';
import MUITextEditor, {
  TDraftEditorProps,
  TMUIRichTextEditorRef,
} from 'mui-rte';

export interface QuestionEditorLanguage {
  CLICK_TO_UPLOAD: string;
}
export interface QuestionEditorComponentProps extends TDraftEditorProps {
  language?: QuestionEditorLanguage;
}
export interface QuestionEditorProps
  extends QuestionEditorComponentProps, AppState, ConnectState, Dispatch {}

const useStyles = makeStyles((theme) => {
  return {
    editorContainer: {
      paddingRight: theme.spacing(1.5),
      paddingLeft: theme.spacing(1.5),
    },
    hidePlaceholder: {
      display: 'block',
    },
  };
});

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  language = {},
  dispatch,
  ...props
}) => {
  const classes = useStyles();
  const questionEditorTexts = useTexts(dispatch, 'editor');
  const ref = useRef<TMUIRichTextEditorRef>(null);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const uploadImage = async (file: File) => {
    const url = await uploadImageToServer(file);
    if (!url) {
      return;
    }
    return {
      data: {
        url,
        width: 300,
        height: 200,
        alignment: 'left',
        type: 'image',
      },
    };
  };

  const handleFileUpload = (file: File) => {
    ref.current?.insertAtomicBlockAsync('IMAGE', uploadImage(file), questionEditorTexts['IMAGE_UPLOADING']);
  };

  return (
    <>
      <UploadImagePopover
        anchor={anchor}
        texts={questionEditorTexts}
        onSubmit={(data, insert) => {
          if (insert && data.file) {
            handleFileUpload(data.file);
          }
          setAnchor(null);
        }}
      />
      <MUITextEditor
        classes={{
          editorContainer: classes.editorContainer,
          hidePlaceholder: classes.hidePlaceholder,
        }}
        ref={ref}
        controls={['save', 'undo', 'redo', 'title', 'bold', 'italic', 'underline', 'strikethrough', 'highlight', 'link', 'upload-image', 'numberList', 'bulletList', 'quote', 'code', 'media', 'clear']}
        customControls={[
          {
            name: 'upload-image',
            icon: <Image />,
            type: 'callback',
            onClick: (_editorState, _name, anchor) => {
              setAnchor(anchor);
            },
          },
        ]}
        {...props}
      />
    </>
  );
};

export default connect(({ app }: ConnectState) => app)(QuestionEditor);
