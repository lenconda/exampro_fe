import React from 'react';
import './index.less';
import { Loading } from 'mdi-material-ui';
import { CircularProgress, SvgIcon } from '@material-ui/core';

const Fallback = () => {
  return (
    <div className="app-fallback__backdrop">
      <CircularProgress
        color="primary"
        classes={{ root: 'app-fallback__backdrop__icon' }}
      />
    </div>
  );
};

export default Fallback;
