import { Dispatch } from '../../../interfaces';
import { AppState } from '../../../models/app';
import { connect } from '../../../patches/dva';
import { ConnectState } from '../../../models';
import Fallback from '../../../components/Fallback';
import React, { Suspense } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import _ from 'lodash';

export interface AccountPageProps extends Dispatch, AppState {}

// /home/account/profile
const HomeAccountProfilePage = React.lazy(() => import('./Profile'));

const AccountPage: React.FC<AccountPageProps> = () => {
  return (
    <Suspense fallback={<Fallback />}>
      <Switch>
        <Route path="/home/account/profile" component={HomeAccountProfilePage} />
        <Redirect from="/home/account" to="/home/account/profile" exact={true} />
      </Switch>
    </Suspense>
  );
};

export default connect(({ app }: ConnectState) => app)(AccountPage);
