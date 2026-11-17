import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || '';

// When no backend URL is configured the app runs on the localStorage mock DB.
export const USE_MOCK = !API_URL;

export const TOKEN_KEY = 'mb_token';

const http = axios.create({
  baseURL: API_URL ? `${API_URL.replace(/\/$/, '')}/api` : '/api',
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default http;
