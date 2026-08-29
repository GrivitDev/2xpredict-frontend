import axios from 'axios';
import Cookies from 'js-cookie';

const baseURL =
  process.env.NEXT_PUBLIC_API_URL;

if (!baseURL) {
  throw new Error(
    'NEXT_PUBLIC_API_URL is missing',
  );
}

const api = axios.create({
  baseURL,
});

// ============================================================
// ATTACH JWT
// ============================================================

api.interceptors.request.use(
  (config) => {
    if (
      typeof window !== 'undefined'
    ) {
      const token =
        Cookies.get('token');

      if (token) {
        config.headers =
          config.headers ?? {};

        config.headers.Authorization =
          `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) =>
    Promise.reject(error),
);

export default api;