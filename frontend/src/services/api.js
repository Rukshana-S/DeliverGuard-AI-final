import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const AUTH_PATHS = ['/login', '/register', '/onboarding'];

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const onAuthPage = AUTH_PATHS.some((p) => window.location.pathname.startsWith(p));
      if (!onAuthPage) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    if (err.response?.status === 403 && err.response?.data?.message === 'ACCOUNT_BLOCKED') {
      localStorage.removeItem('token');
      window.location.href = '/login?blocked=1';
    }
    return Promise.reject(err);
  }
);

export default api;
