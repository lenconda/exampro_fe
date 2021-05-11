import { Dispatch } from '../../interfaces';
import { AppState } from '../../models/app';
import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import AppIndicator from '../../components/AppIndicator';
import React from 'react';
import _ from 'lodash';

export interface ForbiddenPageProps extends Dispatch, AppState {}

const ForbiddenPage: React.FC<ForbiddenPageProps> = () => {
  return (
    <div className="app-page app-page-403">
      <AppIndicator type="forbidden" />
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(ForbiddenPage);
