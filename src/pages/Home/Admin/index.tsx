import { Dispatch, RoleResponseData, User } from '../../../interfaces';
import { AppState } from '../../../models/app';
import { connect } from '../../../patches/dva';
import { ConnectState } from '../../../models';
import Fallback from '../../../components/Fallback';
import { useAppPathname } from '../../../utils/history';
import { getUserProfile } from '../service';
import React, { Suspense, useEffect, useState } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import _ from 'lodash';

export interface AccountPageProps extends Dispatch, AppState {}

const permissionMap = {
  '/home/admin/role': ['user/admin/role', 'user/admin/layout', 'user/admin/user'],
  '/home/admin/menu': ['user/admin/layout'],
};

// /home/admin/menu
const HomeAdminMenuPage = React.lazy(() => import('./Menu'));
// /home/admin/user
const HomeAdminUserPage = React.lazy(() => import('./User'));
// /home/admin/role
const HomeAdminRolePage = React.lazy(() => import('./Role'));

const AccountPage: React.FC<AccountPageProps> = () => {
  const history = useHistory();
  const [profile, setProfile] = useState<User>(undefined);
  const [permitted, setPermitted] = useState<boolean>(true);
  const locationPathname = useAppPathname();

  const checkPermission = (roles: RoleResponseData[], pathname: string): boolean => {
    const roleIds = roles.map((role) => role.id);
    if (roleIds.length === 0) { return false }
    if (Object.keys(permissionMap).indexOf(pathname) === -1) {
      return true;
    }
    const permittedRoleIds = permissionMap[pathname] || [];
    if (_.isArray(permittedRoleIds) && permittedRoleIds.length > 0) {
      if (_.intersection(permittedRoleIds, roleIds).length === 0 && roleIds.indexOf('user/admin/system') === -1) {
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    if (profile && locationPathname) {
      setPermitted(checkPermission(profile.roles || [], locationPathname));
    }
  }, [locationPathname, profile]);

  useEffect(() => {
    getUserProfile().then((profile) => {
      setProfile(profile);
    });
  }, []);

  useEffect(() => {
    if (!permitted) {
      history.push('/403');
    }
  }, [permitted]);

  return (
    <Suspense fallback={<Fallback />}>
      <Switch>
        <Route path="/home/admin/menu" component={HomeAdminMenuPage} />
        <Route path="/home/admin/user" component={HomeAdminUserPage} />
        <Route path="/home/admin/role" component={HomeAdminRolePage} />
      </Switch>
    </Suspense>
  );
};

export default connect(({ app }: ConnectState) => app)(AccountPage);
