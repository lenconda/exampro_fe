import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import InputBase, { InputBaseProps } from '@material-ui/core/InputBase';
import Paper from '@material-ui/core/Paper';
import ClearIcon from '@material-ui/icons/Clear';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';

export interface AppSearchBarInputProps extends InputBaseProps {
  leftNode?: React.ReactNode;
  rightNode?: React.ReactNode;
  onValueChange?(value: string): void;
  onWrapperBlur?(value: React.FocusEvent<HTMLDivElement>): void;
}

const useStyles = makeStyles((theme) => {
  return {
    wrapper: {
      display: 'flex',
      alignItems: 'center',
      padding: 1,
      paddingRight: theme.spacing(1),
      paddingLeft: theme.spacing(1),
      flexGrow: 1,
      flexShrink: 0,
    },
  };
});

const Input: React.FC<AppSearchBarInputProps> = ({
  leftNode = null,
  rightNode = null,
  value: propValue = '' as string,
  onBlur,
  onValueChange,
  onWrapperBlur,
  ...props
}) => {
  const classes = useStyles();
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    setValue(propValue as string);
  }, [propValue]);

  return (
    <Paper
      classes={{ root: classes.wrapper }}
      onBlur={(event) => {
        if (_.isFunction(onWrapperBlur)) {
          onWrapperBlur(event);
        }
      }}
    >
      {leftNode}
      <InputBase
        {...props}
        value={value}
        classes={{
          root: 'app-search-wrapper__input__root',
          input: 'app-search-wrapper__input__input',
        }}
        onChange={(event) => {
          const value = event.target.value;
          setValue(value);
          if (_.isFunction(onValueChange)) {
            onValueChange(value);
          }
        }}
      />
      {
        value && (
          <IconButton
            size="small"
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => {
              if (_.isFunction(onValueChange)) {
                onValueChange('');
              }
            }}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        )
      }
      {rightNode}
    </Paper>
  );
};

export default Input;
