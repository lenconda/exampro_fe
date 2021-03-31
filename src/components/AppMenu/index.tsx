import AppMenuItem from './Item';
import { SidebarMenuItem } from '../../interfaces';
import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import { CircularProgress, Toolbar } from '@material-ui/core';
import clsx from 'clsx';
import './index.less';

export interface AppMenuProps {
  items: SidebarMenuItem[];
  loading?: boolean;
}

const AppMenu: React.FC<AppMenuProps> = ({
  items = [],
  loading = false,
}) => {
  const classes = useStyles();

  return (
    <List className={clsx('app-sidebar', classes.appMenu, loading ? 'loading' : '')} disablePadding={true}>
      <Toolbar className="app-sidebar__logo">
        <img src="/assets/images/logo_text.svg" alt="logo_text" />
      </Toolbar>
      {
        !loading ?
          (
            items.map((item, index) => (
              <AppMenuItem item={item} key={index} />
            ))
          )
          : (
            <div className="app-loading">
              <CircularProgress classes={{ root: 'app-loading__icon' }} color="primary" />
            </div>
          )
      }
    </List>
  );
};

const drawerWidth = 240;

const useStyles = makeStyles(theme => createStyles({
  appMenu: {
    width: '100%',
  },
  navList: {
    width: drawerWidth,
  },
  menuItem: {
    width: drawerWidth,
  },
}));

export default AppMenu;
