// /frontend/src/api/axios.js

import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // This is crucial for sending/receiving httpOnly cookies
});

export default apiClient;