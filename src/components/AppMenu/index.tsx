import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import AppMenuItem from './Item';
import { Toolbar } from '@material-ui/core';
import './index.less';
import clsx from 'clsx';

const appMenuItems = [
  {
    title: 'Dashboard',
    link: '/',
    icon: 'ViewDashboard',
  },
  {
    title: 'Orders',
    link: '/orders',
    icon: 'Cart',
  },
  {
    title: 'Customers',
    link: '/customers',
    icon: 'Account',
  },
  {
    title: 'Reports',
    link: '/reports',
    icon: 'FileChart',
  },
  {
    title: 'Nested Pages',
    icon: 'BookMultiple',
    items: [
      {
        title: 'Level 2',
      },
      {
        title: 'Level 2',
        items: [
          {
            title: 'Level 3',
          },
          {
            title: 'Level 3',
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
        <img src="/assets/images/logo_text.svg" alt="" />
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
