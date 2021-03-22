import React from 'react';
import './index.less';
import { Loading } from 'mdi-material-ui';
import { SvgIcon } from '@material-ui/core';

const Fallback = () => {
  console.log(111);
  return (
    <div className="app-fallback__backdrop">
      <SvgIcon
        component={Loading}
        classes={{ root: 'app-fallback__backdrop__icon' }}
        color="primary"
      />
    </div>
  );
};

export default Fallback;
