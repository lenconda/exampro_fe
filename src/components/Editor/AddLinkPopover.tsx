import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';

type TAnchor = HTMLElement | null;

interface IUploadImagePopoverProps {
  anchor: TAnchor;
  texts?: Record<string, string>;
  onSubmit: (data: string, insert: boolean) => void;
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
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    setState({
      anchor: props.anchor,
      isCancelled: false,
    });
  }, [props.anchor]);

  return (
    <Popover
      anchorEl={state.anchor}
      open={state.anchor !== null}
      onExited={() => {
        props.onSubmit(url, !state.isCancelled);
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
          <TextField
            label="URL"
            fullWidth={true}
            onChange={(event) => {
              setUrl(event.target.value);
            }}
          />
        </Grid>
        <Grid item={true} container={true} xs={12} justify="flex-end">
          <Button
            color="primary"
            variant="text"
            onClick={() => {
              setState({
                anchor: null,
                isCancelled: true,
              });
            }}
          >{texts['CANCEL']}</Button>
          <Button
            color="primary"
            variant="text"
            onClick={() => {
              setState({
                anchor: null,
                isCancelled: false,
              });
            }}
          >{texts['OK']}</Button>
        </Grid>
      </Grid>
    </Popover>
  );
};

export default UploadImagePopover;
