// /frontend/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx'; // <--- Import this
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {/* --- THIS WRAPPER IS MANDATORY --- */}
        <AuthProvider> 
          <App />
          <Toaster position="top-right" />
        </AuthProvider>
        {/* --------------------------------- */}
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);