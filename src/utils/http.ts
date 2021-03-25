import axios from 'axios';
import { History } from 'history';
import _ from 'lodash';
import { Base64 } from 'js-base64';
import AppAlertManager from '../components/AppAlert/Manager';

const createAxiosInstance = (errorsMap: Record<string, string>, history: History<any>) => {
  const instance = axios.create({
    timeout: 3600000,
    baseURL: '/api',
  });

  instance.interceptors.request.use(config => {
    if (localStorage.getItem('token') || sessionStorage.getItem('token')) {
      config.headers = {
        Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
      };
    }
    return config;
  });

  instance.interceptors.response.use((response: any) => {
    const token = _.get(response, 'data.data.token');
    if (token) {
      if (JSON.parse(localStorage.getItem('persist') || 'false')) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
    }
    return response;
  }, (error) => {
    const statusCode = error.response.status || _.get(error, 'response.data.statusCode');
    const errorCode = _.get(error, 'response.data.message') || _.get(error, 'response.data.error');

    if (statusCode === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      const { pathname, hash, search } = window.location;
      const redirect = Base64.encode(`${pathname}${search}${hash}`);
      if (pathname !== '/user/auth') {
        history.push({
          pathname: '/user/auth',
          search: `?redirect=${redirect}`,
        });
      }
      return;
    }

    if (errorCode) {
      AppAlertManager.create(errorsMap[errorCode] || errorCode, { variant: 'error' });
    }

    if (statusCode === 403) {
      return Promise.reject(error);
    }

    return;
  });

  return instance;
};

export default createAxiosInstance;
