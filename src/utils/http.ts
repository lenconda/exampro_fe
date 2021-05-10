import { encodeRedirectPathname } from './redirect';
import AppAlertManager from '../components/AppAlert/Manager';
import axios from 'axios';
import { History } from 'history';
import _ from 'lodash';
import qs from 'qs';

const createAxiosInstance = (errorsMap: Record<string, string>, history: History<any>) => {
  const createPrivateInstance = (handleError = true) => {
    const instance = axios.create({
      timeout: 3600000,
      baseURL: '/api',
    });

    instance.interceptors.request.use(config => {
      const searchToken = _.get(qs.parse(window.location.search.slice(1)), 'token') as string;
      if (searchToken) {
        if (JSON.parse(localStorage.getItem('persist') || 'false')) {
          localStorage.setItem('token', searchToken);
        } else {
          sessionStorage.setItem('token', searchToken);
        }
      }

      const token = localStorage.getItem('token') || sessionStorage.getItem('token') as string;

      if (token) {
        config.headers = {
          Authorization: `Bearer ${token}`,
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

      if (statusCode === 401 || errorCode === 'ERR_ACCOUNT_NOT_FOUND') {
        const { pathname } = history.location;
        const redirect = encodeRedirectPathname(history.location);
        localStorage.removeItem('token');
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

      if (handleError && statusCode !== 403) {
        return;
      } else {
        return Promise.reject(error);
      }
    });

    return instance;
  };
  return createPrivateInstance;
};

export default createAxiosInstance;
