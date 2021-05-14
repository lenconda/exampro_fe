import AppMenuItem from './Item';
import { Dispatch, SidebarMenuItem } from '../../interfaces';
import AppIndicator from '../AppIndicator';
import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import { AppState } from '../../models/app';
import { useTexts } from '../../utils/texts';
import AppPaperEditor from '../AppPaperEditor';
import AppQuestionEditor from '../AppQuestionEditor';
import AppExamEditor from '../AppExamEditor';
import React, { useState } from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import FileClockOutlineIcon from 'mdi-material-ui/FileClockOutline';
import FolderPlusIcon from 'mdi-material-ui/FolderPlus';
import MessageQuestionOutlineIcon from 'mdi-material-ui/MessageQuestionOutline';
import NoteTextOutlineIcon from 'mdi-material-ui/NoteTextOutline';
import clsx from 'clsx';
import _ from 'lodash';
import './index.less';
import { useHistory } from 'react-router';

export interface AppMenuProps {
  items: SidebarMenuItem[];
  loading?: boolean;
}
export interface AppMenuComponentProps extends AppMenuProps, AppState, Dispatch {}

const drawerWidth = 240;
const resourceMap = {
  question: {
    path: '/home/questions',
    icon: MessageQuestionOutlineIcon,
  },
  paper: {
    path: '/home/papers',
    icon: NoteTextOutlineIcon,
  },
  exam: {
    path: '/home/exams?role=resource%2Fexam%2Finitiator',
    icon: FileClockOutlineIcon,
  },
};

const useStyles = makeStyles((theme) => createStyles({
  appMenu: {
    width: '100%',
  },
  navList: {
    width: drawerWidth,
  },
  menuItem: {
    width: drawerWidth,
  },
  buttonWrapper: {
    padding: theme.spacing(2),
  },
  createResourceMenuPaper: {
    minWidth: 320,
  },
  createResourceMenuItem: {
    '& svg': {
      marginRight: theme.spacing(2),
      opacity: 0.6,
    },
  },
}));

const AppMenu: React.FC<AppMenuComponentProps> = ({
  items = [],
  loading = false,
  dispatch,
}) => {
  const classes = useStyles();
  const history = useHistory();
  const systemTexts = useTexts(dispatch, 'system');
  const [openStatus, setOpenStatus] = useState<Record<string, boolean>>({
    question: false,
    paper: false,
    exam: false,
  });
  const [createResourceAnchor, setCreateResourceAnchor] = useState<HTMLButtonElement>(null);

  const handleSetOpenStatus = (key: string, status: boolean) => {
    const newOpenStatus = Object.keys(openStatus).reduce((result, currentKey) => {
      result[currentKey] = currentKey === key ? status : false;
      return result;
    }, {});
    setOpenStatus(newOpenStatus);
  };

  const handleSubmitResource = (type: string) => {
    handleSetOpenStatus(type, false);
    const currentRedirectPath = _.get(resourceMap[type], 'path');
    if (_.isString(currentRedirectPath)) {
      history.push(currentRedirectPath);
    }
  };

  return (
    <>
      <List className={clsx('app-sidebar', classes.appMenu, loading ? 'loading' : '')} disablePadding={true}>
        <Toolbar className="app-sidebar__logo">
          <img src="/assets/images/logo_text.svg" alt="logo_text" />
        </Toolbar>
        <Box className={classes.buttonWrapper}>
          <Button
            color="primary"
            variant="contained"
            size="large"
            fullWidth={true}
            startIcon={<FolderPlusIcon />}
            onClick={(event) => setCreateResourceAnchor(event.currentTarget as HTMLButtonElement)}
          >{systemTexts['CREATE_NEW']}</Button>
          <Menu
            anchorEl={createResourceAnchor}
            open={Boolean(createResourceAnchor)}
            classes={{ paper: classes.createResourceMenuPaper }}
            onClose={() => setCreateResourceAnchor(null)}
          >
            {
              Object.keys(resourceMap).map((type, index) => {
                const Icon = _.get(resourceMap[type], 'icon');
                return (
                  <MenuItem
                    key={index}
                    classes={{ root: classes.createResourceMenuItem }}
                    onClick={() => {
                      setCreateResourceAnchor(null);
                      handleSetOpenStatus(type, true);
                    }}
                  >
                    {
                      Icon && <Icon />
                    }
                    <Typography>{systemTexts[type.toUpperCase()]}</Typography>
                  </MenuItem>
                );
              })
            }
          </Menu>
        </Box>
        {
          !loading ?
            (
              items.map((item, index) => (
                <AppMenuItem item={item} key={index} />
              ))
            )
            : <AppIndicator type="loading" />
        }
      </List>
      <AppPaperEditor
        open={openStatus.paper}
        mode="create"
        onClose={() => handleSetOpenStatus('paper', false)}
        onSubmitPaper={() => handleSubmitResource('paper')}
      />
      <AppQuestionEditor
        mode="create"
        open={openStatus.question}
        onSubmitQuestion={() => handleSubmitResource('question')}
        onClose={() => handleSetOpenStatus('question', false)}
      />
      <AppExamEditor
        open={openStatus.exam}
        mode="create"
        onClose={() => handleSetOpenStatus('exam', false)}
        onSubmitExam={() => handleSubmitResource('exam')}
      />
    </>
  );
};

export default connect(({ app }: ConnectState) => app)(AppMenu) as React.FC<AppMenuProps>;
