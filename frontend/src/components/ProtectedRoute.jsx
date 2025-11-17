// frontend/src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  // 1. Get BOTH 'userInfo' and 'isLoading' from our context
  const { userInfo, isLoading } = useAuth();
  const location = useLocation();

  // 2. FIX: If the auth check is still running, show a loading screen
  // and DO NOT redirect to /login.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Checking authentication...</div>
      </div>
    );
  }

  // 3. This code runs only after authentication is confirmed false
  if (!userInfo) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 4. If loading is false AND we have a user, show the page
  return <Outlet />;
};

export default ProtectedRoute;