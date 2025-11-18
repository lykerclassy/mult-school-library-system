// frontend/src/api/axios.js

import axios from 'axios';

const apiClient = axios.create({
  // We use the relative path because we have the Vite Proxy set up
  baseURL: '/api/v1', 
  withCredentials: true, // This allows the browser to send the cookie automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;