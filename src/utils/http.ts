import axios from 'axios';
import _ from 'lodash';
import Manager from '../components/AppAlert/Manager';

const createAxiosInstance = (errorsMap) => {
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
    if (response.data.token) {
      if (JSON.parse(localStorage.getItem('persist') || 'false')) {
        localStorage.setItem('token', response.data.token);
      } else {
        sessionStorage.setItem('token', response.data.token);
      }
    }
    return response;
  }, (error) => {
    if (
      error.response.status === 401
      || _.get(error, 'response.data.statusCode') === 401
    ) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      const location = window.location;
      console.log(location);
    }
    // if (error.response.status === 401) {
    //   localStorage.removeItem('token');
    //   // const { pathname, search, hash } = history.location;
    //   // if (pathname !== '/signin') {
    //   // history.push(`/signin?redirect=${Base64.encode(`${pathname}${search}${hash}`)}`);
    //   // }
    // } else {
    // }
    // if (error.response.data.message) {
    // Manager.create(, {});
    // }
    return Promise.reject(error);
  });

  return instance;
};

export default createAxiosInstance;
