import { SidebarMenuItem } from '../../../interfaces';
import { useAppPathname } from '../../../utils/history';
import Image from '../../Image';
import React, { useEffect, useState } from 'react';
import Collapse from '@material-ui/core/Collapse';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import IconExpandLessIcon from '@material-ui/icons/ExpandLess';
import IconExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {
  lighten,
  makeStyles,
} from '@material-ui/core/styles';
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
    appMenuItemActive: {
      backgroundColor: lighten(theme.palette.primary.main, 0.85),
      '&:hover': {
        backgroundColor: lighten(theme.palette.primary.main, 0.85),
      },
    },
    icon: {
      '& path': {
        fill: theme.palette.primary.main,
      },
    },
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
  const [pathname, setPathname] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(false);

  const handleClick = () => {
    if (items.length === 0) {
      history.push(pathname);
    }
    setOpen(!open);
  };

  useEffect(() => {
    const currentPathname = `${prefix}${itemPathname}`;
    setPathname(currentPathname);
    setIsActive(currentPathname === locationPathname);
  }, [itemPathname, locationPathname]);

  useEffect(() => {
    if (items.length > 0) {
      const isMatchChildMenu = items.findIndex((currentMenuItem) => {
        const { pathname: currentMenuRelativePathname } = currentMenuItem;
        const currentMenuPathname = `${prefix}${itemPathname}${currentMenuRelativePathname}`;
        return currentMenuPathname === locationPathname;
      });
      if (isMatchChildMenu !== -1) {
        setOpen(true);
      }
    }
  }, [items, locationPathname]);

  const menuItemChildren = isExpandable ? (
    <Collapse in={open} timeout="auto" unmountOnExit={true}>
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
            [classes.appMenuItemActive]: isActive,
          }, classes.appMenuItem),
        }}
      >
        <ListItemIcon>
          <Image icon={icon} className={classes.icon} />
        </ListItemIcon>
        <Tooltip title={title}>
          <ListItemText
            primary={
              <Typography
                noWrap={true}
                classes={{ root: 'app-menu__item__text' }}
              >{title}</Typography>
            }
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
