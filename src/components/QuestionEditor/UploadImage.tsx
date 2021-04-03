import Card from '@material-ui/core/Card';
import Close from '@material-ui/icons/Close';
import Done from '@material-ui/icons/Done';
import Backup from '@material-ui/icons/Backup';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';

type TAnchor = HTMLElement | null;

interface TUploadImageData {
  file?: File;
}

interface IUploadImagePopoverProps {
  anchor: TAnchor;
  texts?: Record<string, string>;
  onSubmit: (data: TUploadImageData, insert: boolean) => void;
}

interface TUploadImagePopoverState {
  anchor: TAnchor;
  isCancelled: boolean;
}

const cardPopoverStyles = makeStyles((theme) => {
  return {
    popoverPaper: {
      overflowY: 'hidden',
    },
    root: {
      padding: 10,
      maxWidth: 350,
    },
    textField: {
      width: '100%',
    },
    input: {
      display: 'none',
    },
    cardRoot: {
      borderStyle: 'dashed',
      width: '100%',
      minHeight: 120,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: theme.palette.grey.A200,
      userSelect: 'none',
      cursor: 'pointer',
    },
    uploadIcon: {
      fontSize: 36,
    },
  };
});

const UploadImagePopover: React.FC<IUploadImagePopoverProps> = ({
  texts = {},
  ...props
}) => {
  const classes = cardPopoverStyles(props);
  const [state, setState] = useState<TUploadImagePopoverState>({
    anchor: null,
    isCancelled: false,
  });
  const [imageBase64Content, setImageBase64Content] = useState<string>('');
  const [data, setData] = useState<TUploadImageData>({});

  useEffect(() => {
    setState({
      anchor: props.anchor,
      isCancelled: false,
    });
    setData({
      file: undefined,
    });
  }, [props.anchor]);

  useEffect(() => {
    if (data.file) {
      const reader = new FileReader();
      reader.readAsDataURL(data.file);
      reader.onload = (event) => {
        setImageBase64Content(event?.target?.result?.toString());
      };
    }
  }, [data.file]);

  return (
    <Popover
      anchorEl={state.anchor}
      open={state.anchor !== null}
      onExited={() => {
        props.onSubmit(data, !state.isCancelled);
      }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      classes={{
        paper: classes.popoverPaper,
      }}
    >
      <Grid container={true} spacing={1} className={classes.root}>
        <Grid item={true} style={{ width: '100%' }}>
          <input
            accept="image/*"
            className={classes.input}
            id="editor-upload-file"
            type="file"
            onChange={(event) => {
              setData({
                ...data,
                file: event.target.files![0],
              });
            }}
          />
          <label htmlFor="editor-upload-file">
            <Card
              elevation={0}
              variant="outlined"
              raised={true}
              classes={{ root: classes.cardRoot }}
            >
              {
                data.file
                  ? (
                    <>
                      <img src={imageBase64Content} width="100%" />
                    </>
                  )
                  : (
                    <>
                      <Backup classes={{ root: classes.uploadIcon }} />
                      <Typography noWrap={true}>{texts['CLICK_TO_UPLOAD']}</Typography>
                    </>
                  )
              }
            </Card>
          </label>
        </Grid>
        <Grid item={true} container={true} xs={12} justify="flex-end">
          <Button
            onClick={() => {
              setState({
                anchor: null,
                isCancelled: true,
              });
            }}
          ><Close /></Button>
          <Button
            onClick={() => {
              setState({
                anchor: null,
                isCancelled: false,
              });
            }}
          ><Done /></Button>
        </Grid>
      </Grid>
    </Popover>
  );
};

export default UploadImagePopover;
