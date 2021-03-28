import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import AppMenuItem from './Item';
import { Toolbar } from '@material-ui/core';
import clsx from 'clsx';
import { SidebarMenuItem } from '../../interfaces';
import './index.less';

export interface AppMenuProps {
  items: SidebarMenuItem[];
}

const AppMenu: React.FC<AppMenuProps> = ({
  items = [],
}) => {
  const classes = useStyles();

  return (
    <List className={clsx('app-sidebar__menu', classes.appMenu)} disablePadding={true}>
      <Toolbar className="app-sidebar__menu__logo-wrapper">
        <img src="/assets/images/logo_text.svg" alt="logo_text" />
      </Toolbar>
      {
        items.map((item, index) => (
          <AppMenuItem item={item} key={index} />
        ))
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
