import axios from 'axios';

axios.defaults.withCredentials = true;

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': import.meta.env.VITE_BACKEND_URL,
  },
  withCredentials: true,
});
