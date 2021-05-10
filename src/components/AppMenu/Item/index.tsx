import { SidebarMenuItem } from '../../../interfaces';
import { useAppPathname } from '../../../utils/history';
import React, { useEffect, useState } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import Collapse from '@material-ui/core/Collapse';
import IconExpandLessIcon from '@material-ui/icons/ExpandLess';
import IconExpandMoreIcon from '@material-ui/icons/ExpandMore';
import * as icons from 'mdi-material-ui';
import { makeStyles, SvgIconTypeMap, Tooltip, Typography } from '@material-ui/core';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';
import { useHistory } from 'react-router';
import './index.less';
import clsx from 'clsx';

export interface AppMenuItemProps {
  item: SidebarMenuItem;
  prefix?: string;
}

const useStyles = makeStyles((theme) => {
  return {
    appMenuItem: (props: Record<string, any>) => ({
      paddingLeft: theme.spacing(2) + ((props.level || 1) - 1) * theme.spacing(1),
    }),
  };
});

const AppMenuItem: React.FC<AppMenuItemProps> = ({
  item,
  prefix = '',
}) => {
  const classes = useStyles({ level: prefix.split('/').length });
  const { items = [], title = '', icon, pathname: itemPathname } = item;
  const isExpandable = items && items.length > 0;
  const history = useHistory();
  const locationPathname = useAppPathname();
  const [open, setOpen] = useState<boolean>(false);
  const [Icon, setIcon] = useState<OverridableComponent<SvgIconTypeMap<{}, 'svg'>>>(null);
  const [pathname, setPathname] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(false);

  useEffect(() => {
    setIcon(icons[icon]);
  }, [icon]);

  useEffect(() => {
    const currentPathname = `${prefix}${itemPathname}`;
    setPathname(currentPathname);
    setIsActive(currentPathname === locationPathname);
  }, [itemPathname, locationPathname]);

  const handleClick = () => {
    if (items.length === 0) {
      history.push(pathname);
    }
    setOpen(!open);
  };

  const menuItemChildren = isExpandable ? (
    <Collapse in={open} timeout="auto" unmountOnExit>
      <Divider />
      <List classes={{ root: 'app-menu__children' }}>
        {
          items.map((item, index) => (
            <AppMenuItem
              prefix={`${prefix}${pathname}`}
              item={item}
              key={index}
            />
          ))
        }
      </List>
    </Collapse>
  ) : null;

  return (
    <>
      <ListItem
        button={true}
        onClick={handleClick}
        classes={{
          root: clsx('app-menu__item', {
            'active': isActive,
          }, classes.appMenuItem),
        }}
      >
        {
          !!Icon && (
            <ListItemIcon>
              <Icon className="app-menu__item__icon" />
            </ListItemIcon>
          )
        }
        <Tooltip title={title}>
          <ListItemText
            primary={
              <Typography
                noWrap={true}
                classes={{ root: 'app-menu__item__text' }}
              >{title}</Typography>
            }
            inset={!Icon}
          />
        </Tooltip>
        {
          isExpandable && (
            open ? <IconExpandLessIcon /> : <IconExpandMoreIcon />
          )
        }
      </ListItem>
      {menuItemChildren}
    </>
  );
};

export default AppMenuItem;
