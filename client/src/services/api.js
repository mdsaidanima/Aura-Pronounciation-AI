import axios from 'axios';

const normalizeBaseUrl = (value) => {
  const trimmed = value?.trim();
  if (!trimmed) return '/api';

  if (/^https?:\/\//i.test(trimmed)) {
    const withoutTrailingSlash = trimmed.replace(/\/+$/, '');
    return withoutTrailingSlash.endsWith('/api') ? withoutTrailingSlash : `${withoutTrailingSlash}/api`;
  }

  return trimmed.replace(/\/+$/, '') || '/api';
};

const api = axios.create({
  baseURL: normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token if saved
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aura-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch global API errors (e.g. token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server returns a 401 Unauthorized, clean up and redirect
    if (error.response && error.response.status === 401) {
      console.warn('Authentication token expired or invalid. Logging out...');
      localStorage.removeItem('aura-token');
      localStorage.removeItem('aura-user');
      
      // Only redirect if not already on login/signup/landing pages
      const publicPaths = ['/login', '/signup', '/'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
