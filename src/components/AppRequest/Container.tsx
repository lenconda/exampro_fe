import AppRequestManager, { AppRequestConfig } from './Manager';
import createAxiosInstance from '../../utils/http';
import { connect } from '../../patches/dva';
import { ConnectState } from '../../models';
import { AppState } from '../../models/app';
import { Dispatch } from '../../interfaces';
import { useTexts } from '../../utils/texts';
import _ from 'lodash';
import { useHistory } from 'react-router';
import { AxiosRequestConfig } from 'axios';
import React, { useEffect } from 'react';

export interface AppRequestContainerProps extends AppState, Dispatch {}
export type AppRequestHandlerConfig = AxiosRequestConfig & AppRequestConfig & {
  cb: Function;
};

const Container: React.FC<AppRequestContainerProps> = (props) => {
  const history = useHistory();
  const errorTexts = useTexts(props.dispatch, 'errors');
  const http = createAxiosInstance(errorTexts, history);

  useEffect(() => {
    const handler = (config: AppRequestHandlerConfig) => {
      const { cb, handleError, ...currentConfig } = config;
      if (_.isFunction(cb)) {
        http(handleError)
          .request(currentConfig)
          .then((res) => cb(res))
          .catch((error) => cb(null, error));
      }
    };
    AppRequestManager.addChangeListener(handler);
    return () => {
      AppRequestManager.removeChangeListener(handler);
    };
  }, [errorTexts]);

  return (
    <></>
  );
};

export default connect(({ app }: ConnectState) => app)(Container);
