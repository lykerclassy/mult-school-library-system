// frontend/src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { userInfo } = useAuth();
  const location = useLocation();

  // The AuthProvider handles the loading spinner. 
  // If we are here, we know the final status of userInfo.

  if (!userInfo) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;