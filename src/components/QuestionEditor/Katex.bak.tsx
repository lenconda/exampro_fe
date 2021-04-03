import { useDebouncedValue } from '../../utils/hooks';
import Close from '@material-ui/icons/Close';
import Done from '@material-ui/icons/Done';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { BlockMath } from 'react-katex';
import _ from 'lodash';

type TAnchor = HTMLElement | null;

interface TKatexData {
  equation?: string;
}

interface IKatexPopoverProps {
  anchor: TAnchor;
  texts?: Record<string, string>;
  onSubmit: (data: TKatexData, insert: boolean) => void;
}

const katexPopoverStyles = makeStyles((theme) => {
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
  };
});

const KatexPopover: React.FC<IKatexPopoverProps> = ({
  texts = {},
  onSubmit,
  ...props
}) => {
  const classes = katexPopoverStyles(props);
  const [anchor, setAnchor] = useState<TAnchor>(null);
  const [equation, setEquation] = useState<string>('');
  const [isCancelled, setIsCancelled] = useState<boolean>(false);
  const debouncedEquation = useDebouncedValue<string>(equation);

  useEffect(() => {
    setIsCancelled(false);
    setEquation('');
    setAnchor(props.anchor);
  }, [props.anchor]);

  return (
    <Popover
      anchorEl={anchor}
      open={anchor !== null}
      onExited={() => {
        if (_.isFunction(onSubmit)) {
          onSubmit(equation, !isCancelled);
        }
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
            fullWidth={true}
            multiline={true}
            label={texts['EQUATION_CONTENT']}
            onChange={(event) => {
              setEquation(event.target.value);
            }}
          />
        </Grid>
        {
          debouncedEquation && (
            <Grid
              item={true}
              style={{ width: '100%', overflowX: 'scroll' }}
            >
              <BlockMath>{debouncedEquation}</BlockMath>
            </Grid>
          )
        }
        <Grid item={true} container={true} xs={12} justify="flex-end">
          <Button
            onClick={() => {
              setAnchor(null);
              setIsCancelled(true);
            }}
          ><Close /></Button>
          <Button
            onClick={() => {
              setAnchor(null);
              setIsCancelled(false);
            }}
          ><Done /></Button>
        </Grid>
      </Grid>
    </Popover>
  );
};

export default KatexPopover;
