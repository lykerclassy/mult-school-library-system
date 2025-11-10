import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import axios from 'axios';

// --- Axios Global Config ---
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
console.log('API URL:', baseURL);
axios.defaults.baseURL = baseURL;  // Remove /api since it's included in the routes
axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);