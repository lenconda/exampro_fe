import Dropdown, { DropdownProps } from '../Dropdown';
import { Dispatch, LanguageOption } from '../../interfaces';
import { AppState } from '../../models/app';
import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import CheckIcon from '@material-ui/icons/Check';
import LanguageIcon from '@material-ui/icons/Language';
import React, { useEffect } from 'react';
import _ from 'lodash';
import { lighten, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

export interface AppLanguageSelectorProps extends DropdownProps {}
export interface AppLanguageSelectorComponentProps extends AppLanguageSelectorProps, Dispatch, AppState {}

const getSelectedLanguageTitle = (languages: LanguageOption[], locale: string) => {
  const language = languages.find((language) => language.code === locale);
  if (language) {
    return language.title;
  } else {
    return '';
  }
};

const useStyles = makeStyles((theme) => {
  return {
    selectorTypography: {
      maxWidth: 120,
    },
    selectedLanguageOption: {
      backgroundColor: lighten(theme.palette.primary.main, 0.85),
      '&:hover': {
        backgroundColor: lighten(theme.palette.primary.main, 0.85),
      },
    },
  };
});

const AppLanguageSelector: React.FC<AppLanguageSelectorComponentProps> = ({
  dispatch,
  locale,
  languages,
}) => {
  const classes = useStyles();

  useEffect(() => {
    localStorage.setItem('locale', locale);
  }, [locale]);

  return (
    <Dropdown
      classes={{
        list: 'list',
      }}
      trigger={
        <Button
          startIcon={<LanguageIcon />}
        >
          <Typography
            noWrap={true}
            classes={{ root: classes.selectorTypography }}
          >
            {getSelectedLanguageTitle(languages, locale)}
          </Typography>
        </Button>
      }
      closeOnClickBody={true}
    >
      {
        _.isArray(languages) && (
          languages.map((language) => {
            return (
              <MenuItem
                key={language.code}
                classes={{
                  root: clsx({
                    [classes.selectedLanguageOption]: language.code === locale,
                  }),
                }}
                onClick={() => {
                  dispatch({
                    type: 'app/setLocale',
                    payload: language.code,
                  });
                }}
              >
                <Typography classes={{ root: 'app-icon-typography' }}>
                  {
                    locale === language.code && <CheckIcon fontSize="small" style={{ marginLeft: 0 }} />
                  }
                  {language.title}
                </Typography>
              </MenuItem>
            );
          })
        )
      }
    </Dropdown>
  );
};

export default connect(({ app }: ConnectState) => app)(AppLanguageSelector);
