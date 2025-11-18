// frontend/src/api/axios.js

import axios from 'axios';

// 1. Determine the Backend URL
// - If you set VITE_API_URL in your .env or Vercel settings, it uses that.
// - Otherwise, it falls back to localhost (for local testing).
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: baseURL,
  
  // 2. CRITICAL: This allows the browser to send the HTTP-Only Cookie (JWT)
  // across different domains (e.g., Vercel -> Render).
  withCredentials: true,
  
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;