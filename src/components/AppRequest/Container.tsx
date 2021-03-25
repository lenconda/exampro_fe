import React, { useEffect } from 'react';
import { AxiosRequestConfig } from 'axios';
import AppRequestManager from './Manager';
import createAxiosInstance from '../../utils/http';
import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import { AppState } from '../../models/app';
import _ from 'lodash';
import { useHistory } from 'react-router-dom';

export interface AppRequestContainerProps extends AppState {}

const Container: React.FC<AppRequestContainerProps> = (props) => {
  const history = useHistory();
  const http = createAxiosInstance(props.i18n[props.locale].errors, history);

  useEffect(() => {
    const handler = (config: AxiosRequestConfig & { cb: Function }) => {
      http
        .request(_.omit(config, ['cb']))
        .then((res) => config.cb(res))
        .catch((error) => config.cb(null, error));
    };
    AppRequestManager.addChangeListener(handler);
    return () => {
      AppRequestManager.removeChangeListener(handler);
    };
  }, []);

  return (
    <></>
  );
};

export default connect(({ app }: ConnectState) => app)(Container);