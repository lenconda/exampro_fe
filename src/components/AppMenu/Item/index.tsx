import React, { useEffect, useState } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import Collapse from '@material-ui/core/Collapse';
import IconExpandLess from '@material-ui/icons/ExpandLess';
import IconExpandMore from '@material-ui/icons/ExpandMore';
import * as icons from 'mdi-material-ui';
import { SvgIconTypeMap, Tooltip, Typography } from '@material-ui/core';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';
import { SidebarMenuItem } from '../../../interfaces';
import { NavLink } from 'react-router-dom';
import './index.less';

export interface AppMenuItemProps {
  item: SidebarMenuItem;
  prefix?: string;
}

const AppMenuItem: React.FC<AppMenuItemProps> = ({
  item,
  prefix = '',
}) => {
  const { items = [], title, icon, pathname } = item;
  const isExpandable = items && items.length > 0;
  const [open, setOpen] = useState<boolean>(false);
  const [Icon, setIcon] = useState<OverridableComponent<SvgIconTypeMap<{}, 'svg'>>>(null);

  useEffect(() => {
    setIcon(icons[icon]);
  }, [icon]);

  const handleClick = () => {
    setOpen(!open);
  };

  const AppMenuItemRoot: React.FC = () => {
    const componentContent = (
      <>
        {
          !!Icon && (
            <ListItemIcon>
              <Icon className="app-menu__item__icon" />
            </ListItemIcon>
          )
        }
        <Tooltip title={title}>
          <ListItemText
            classes={{
              root: 'app-menu__item__text',
            }}
            primary={
              <Typography
                noWrap={true}
                classes={{ root: 'content' }}
              >{title}</Typography>
            }
            inset={!Icon}
          />
        </Tooltip>
        {
          isExpandable
            ? open ? <IconExpandLess /> : <IconExpandMore />
            : null
        }
      </>
    );

    return (
      <ListItem
        button={true}
        onClick={handleClick}
        classes={{ root: `app-menu__item${items.length !== 0 ? ' padding' : ''}` }}
      >
        {
          items.length !== 0
            ? componentContent
            : (
              <NavLink
                className="app-menu__item__link"
                to={`${prefix}${pathname}`}
                exact={true}
                activeClassName="active"
              >{componentContent}</NavLink>
            )
        }
      </ListItem>
    );
  };

  const menuItemChildren = isExpandable ? (
    <Collapse in={open} timeout="auto" unmountOnExit={true}>
      <Divider />
      <List classes={{ root: 'app-menu__child-list' }}>
        {
          items.map((item, index) => (
            <AppMenuItem prefix={`${prefix}${pathname}`} item={item} key={index} />
          ))
        }
      </List>
    </Collapse>
  ) : null;

  return (
    <>
      <AppMenuItemRoot />
      {menuItemChildren}
    </>
  );
};

export default AppMenuItem;
