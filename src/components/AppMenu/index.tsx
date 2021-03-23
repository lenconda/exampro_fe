import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import AppMenuItem from './Item';
import { Toolbar } from '@material-ui/core';
import './index.less';
import clsx from 'clsx';

const appMenuItems = [
  {
    name: 'Dashboard',
    link: '/',
    icon: 'ViewDashboard',
  },
  {
    name: 'Orders',
    link: '/orders',
    icon: 'Cart',
  },
  {
    name: 'Customers',
    link: '/customers',
    icon: 'Account',
  },
  {
    name: 'Reports',
    link: '/reports',
    icon: 'FileChart',
  },
  {
    name: 'Nested Pages',
    icon: 'BookMultiple',
    items: [
      {
        name: 'Level 2',
      },
      {
        name: 'Level 2',
        items: [
          {
            name: 'Level 3',
          },
          {
            name: 'Level 3',
          },
        ],
      },
    ],
  },
];

const AppMenu: React.FC = () => {
  const classes = useStyles();

  return (
    <List className={clsx('app-sidebar__menu', classes.appMenu)} disablePadding={true}>
      <Toolbar className="app-sidebar__menu__logo-wrapper">
        <img src="/assets/images/exampro.svg" alt="" />
        EXAMPRO
      </Toolbar>
      {appMenuItems.map((item, index) => (
        <AppMenuItem {...item} key={index} />
      ))}
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
