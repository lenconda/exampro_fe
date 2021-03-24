import axios from 'axios';
import { Base64 } from 'js-base64';

const createAxiosInstance = (errorsMap) => {
  const instance = axios.create({
    timeout: 3600000,
    baseURL: 'http://localhost:3000/api',
  });

  axios.interceptors.request.use(config => {
    if (localStorage.getItem('token') || sessionStorage.getItem('token')) {
      config.headers = {
        Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
      };
    }
    return config;
  });
  axios.interceptors.response.use((response: any) => {
    if (response.data.token) { if (JSON.parse(localStorage.getItem('persist') || 'false')) {
      localStorage.setItem('token', response.data.token);
    } else {
      sessionStorage.setItem('token', response.data.token);
    } }

    if (response.data.data && Object.prototype.toString.call(response.data.data) === '[object String]') {
      message.success(response.data.data);
    }

    return response;
  }, error => {
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      const { pathname, search, hash } = history.location;
      if (pathname !== '/signin') {
        history.push(`/signin?redirect=${Base64.encode(`${pathname}${search}${hash}`)}`);
      }
    } else {
      if (error.response.data.message) { message.error(error.response.data.message) }
    }
  });

  return instance;
};

export default createAxiosInstance;
