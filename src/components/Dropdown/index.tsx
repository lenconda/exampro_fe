import React, { useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Menu, { MenuProps } from '@material-ui/core/Menu';
import './index.less';
import _ from 'lodash';

export interface DropdownProps extends Omit<MenuProps, 'open'> {
  trigger: React.ReactNode;
  children: React.ReactNode;
  closeOnClickBody?: boolean;
}

const useStyles = makeStyles(() => {
  return {
    wrapper: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'nowrap',
      flexShrink: 0,
      flexGrow: 0,
    },
  };
});

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  closeOnClickBody = false,
  ...props
}) => {
  const classes = useStyles();
  const [open, setOpen] = useState<boolean>(false);
  const anchor = useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        ref={anchor}
        className={classes.wrapper}
        onClick={() => setOpen(true)}
      >{trigger}</div>
      <Menu
        {...props}
        open={open}
        classes={_.merge({ paper: 'app-dropdown' }, props.classes, {
          paper: props?.classes?.paper ? `app-dropdown ${props.classes.paper}` : 'app-dropdown',
        })}
        anchorEl={anchor.current}
        onClose={() => setOpen(false)}
        onClick={() => {
          if (closeOnClickBody) {
            setOpen(false);
          }
        }}
      >{children}</Menu>
    </>
  );
};

export default Dropdown;
