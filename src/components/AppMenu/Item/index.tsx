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
import { SvgIconTypeMap } from '@material-ui/core';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';
import './index.less';

export interface AppMenuItemProps {
  name: string;
  link?: string;
  icon?: string;
  items?: AppMenuItemProps[];
}

const AppMenuItem: React.FC<AppMenuItemProps> = (props) => {
  const { name, icon, items = [] } = props;
  const isExpandable = items && items.length > 0;
  const [open, setOpen] = useState<boolean>(false);
  const [Icon, setIcon] = useState<OverridableComponent<SvgIconTypeMap<{}, 'svg'>>>(null);

  useEffect(() => {
    setIcon(icons[icon]);
  }, [icon]);

  const handleClick = () => {
    setOpen(!open);
  };

  const MenuItemRoot = (
    <ListItem button onClick={handleClick}>
      {/* Display an icon if any */}
      {!!Icon && (
        <ListItemIcon>
          <Icon color="secondary" />
        </ListItemIcon>
      )}
      <ListItemText primary={name} inset={!Icon} classes={{ root: 'app-menu__item__text' }} />
      {/* Display the expand menu if the item has children */}
      {isExpandable && !open && <IconExpandMore />}
      {isExpandable && open && <IconExpandLess />}
    </ListItem>
  );

  const MenuItemChildren = isExpandable ? (
    <Collapse in={open} timeout="auto" unmountOnExit>
      <Divider />
      <List>
        {items.map((item, index) => (
          <AppMenuItem {...item} key={index} />
        ))}
      </List>
    </Collapse>
  ) : null;

  return (
    <>
      {MenuItemRoot}
      {MenuItemChildren}
    </>
  );
};

export default AppMenuItem;
