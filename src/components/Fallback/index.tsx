import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import './index.less';

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
