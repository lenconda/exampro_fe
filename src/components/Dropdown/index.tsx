import React, { useRef, useState } from 'react';
import { Menu } from '@material-ui/core';
import './index.less';

export interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const anchor = useRef(null);

  return (
    <>
      <div ref={anchor} onClick={() => setOpen(true)}>{trigger}</div>
      <Menu
        open={open}
        classes={{ paper: 'app-dropdown', list: 'app-dropdown__list' }}
        anchorEl={anchor.current}
        onClose={() => setOpen(false)}
      >{children}</Menu>
    </>
  );
};

export default Dropdown;
