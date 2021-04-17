import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import { AppState } from '../../models/app';
import { Dispatch } from '../../interfaces';
import { useDebouncedValue } from '../../utils/hooks';
import { useTexts } from '../../utils/texts';
import Button from '@material-ui/core/Button';
import InputBase from '@material-ui/core/InputBase';
import Paper from '@material-ui/core/Paper';
import AddIcon from '@material-ui/icons/Add';
import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';
import { SvgIconTypeMap } from '@material-ui/core';
import _ from 'lodash';

export interface AppSearchBarProps {
  search?: string;
  CreateIcon?: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
  onSearchChange?(search: string): void;
  onCreateClick?(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}
export interface AppSearchBarComponentProps extends AppSearchBarProps, AppState, Dispatch {}

const AppSearchBar: React.FC<AppSearchBarComponentProps> = ({
  search = '',
  CreateIcon = AddIcon,
  onSearchChange,
  onCreateClick,
  dispatch,
}) => {
  const texts = useTexts(dispatch, 'searchBar');
  const [focused, setFocused] = useState<boolean>(false);
  // const [inputSearch, setInputSearch] = useState<string>('');
  // const debouncedInputSearch = useDebouncedValue(inputSearch);

  // useEffect(() => {
  //   if (_.isFunction(onSearchChange)) {
  //     onSearchChange(debouncedInputSearch);
  //   }
  // }, [debouncedInputSearch]);

  return (
    <div className="app-page-interact-wrapper">
      <Paper
        classes={{ root: 'app-search-wrapper' }}
      >
        <InputBase
          classes={{
            root: 'app-search-wrapper__input__root',
            input: 'app-search-wrapper__input__input',
          }}
          placeholder={texts['INPUT_TO_QUERY']}
          defaultValue={search}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(event) => {
            if (_.isFunction(onSearchChange)) {
              onSearchChange(event.target.value);
            }
          }}
        />
      </Paper>
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
