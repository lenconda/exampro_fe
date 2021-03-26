import React, { useRef, useState } from 'react';
import { Menu, MenuProps } from '@material-ui/core';
import './index.less';
import _ from 'lodash';

export interface DropdownProps extends Omit<MenuProps, 'open'> {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  ...props
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const anchor = useRef(null);

  return (
    <>
      <div ref={anchor} onClick={() => setOpen(true)}>{trigger}</div>
      <Menu
        {...props}
        open={open}
        classes={_.merge({ paper: 'app-dropdown' }, props.classes, {
          paper: props?.classes?.paper ? `app-dropdown ${props.classes.paper}` : 'app-dropdown',
        })}
        anchorEl={anchor.current}
        onClose={() => setOpen(false)}
      >{children}</Menu>
    </>
  );
};

export default Dropdown;
