import axios from 'axios';

const client = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://heartbeat-backend-l8pt.onrender.com/api',
  withCredentials: true,
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
