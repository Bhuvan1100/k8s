import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.PROD ? 'https://api.cartcraftio.in' : '');

if (apiBaseUrl) {
  axios.defaults.baseURL = apiBaseUrl;
}

axios.interceptors.request.use((config) => {
  if (typeof config.url !== 'string') return config;

  if (config.url.startsWith('api/')) {
    config.url = `/${config.url}`;
  }

  if (apiBaseUrl && config.url.startsWith('/api/')) {
    config.url = config.url.replace(/^\/api/, '');
  }

  return config;
});
