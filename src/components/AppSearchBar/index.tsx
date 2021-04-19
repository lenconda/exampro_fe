import Input from './Input';
import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import { AppState } from '../../models/app';
import { Dispatch } from '../../interfaces';
import { useTexts } from '../../utils/texts';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';
import { SvgIconTypeMap } from '@material-ui/core';
import _ from 'lodash';

export interface AppSearchBarProps {
  search?: string;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  CreateIcon?: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
  onSearchChange?(search: string): void;
  onCreateClick?(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}
export interface AppSearchBarComponentProps extends AppSearchBarProps, AppState, Dispatch {}

const AppSearchBar: React.FC<AppSearchBarComponentProps> = ({
  search = '',
  leftComponent = null,
  rightComponent = null,
  CreateIcon = AddIcon,
  onSearchChange,
  onCreateClick,
  dispatch,
}) => {
  const texts = useTexts(dispatch, 'searchBar');
  const [focused, setFocused] = useState<boolean>(false);
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    setValue(search);
  }, []);

  return (
    <div className="app-page-interact-wrapper">
      <Input
        classes={{
          root: 'app-search-wrapper__input__root',
          input: 'app-search-wrapper__input__input',
        }}
        placeholder={texts['INPUT_TO_QUERY']}
        value={value}
        leftNode={leftComponent}
        rightNode={rightComponent}
        onFocus={() => setFocused(true)}
        onWrapperBlur={() => {
          setFocused(false);
        }}
        onValueChange={(value) => {
          setValue(value);
          if (_.isFunction(onSearchChange)) {
            onSearchChange(value);
          }
        }}
      />
      <Button
        classes={{
          root: clsx(
            'app-page-interact-wrapper__button',
            focused ? 'collapsed' : '',
          ),
        }}
        color="primary"
        startIcon={!focused ? <CreateIcon /> : null}
        variant="contained"
        onClick={(event) => {
          if (_.isFunction(onCreateClick)) {
            onCreateClick(event);
          }
        }}
      >{!focused ? texts['CREATE'] : null}</Button>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(AppSearchBar) as React.FC<AppSearchBarProps>;
