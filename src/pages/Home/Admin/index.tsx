import { Dispatch } from '../../../interfaces';
import { AppState } from '../../../models/app';
import { connect } from '../../../patches/dva';
import { ConnectState } from '../../../models';
import Fallback from '../../../components/Fallback';
import React, { Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';
import _ from 'lodash';

export interface AccountPageProps extends Dispatch, AppState {}

// /home/admin/menu
const HomeAdminMenuPage = React.lazy(() => import('./Menu'));

const AccountPage: React.FC<AccountPageProps> = () => {
  return (
    <Suspense fallback={<Fallback />}>
      <Switch>
        <Route path="/home/admin/menu" component={HomeAdminMenuPage} />
      </Switch>
    </Suspense>
  );
};

export default connect(({ app }: ConnectState) => app)(AccountPage);
