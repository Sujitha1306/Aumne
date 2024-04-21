import axios from 'axios';

// Since we have proxy in vite.config.js, we don't need a static baseURL, 
// but to be safe and clear, we can leave it empty or point to root.
const client = axios.create({ baseURL: '' });

client.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;
