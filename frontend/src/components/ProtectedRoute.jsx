// /frontend/src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { userInfo } = useAuth();
  const location = useLocation();

  if (!userInfo) {
    // Redirect them to the /login page, but save the location they were
    // trying to go to so we can send them there after they login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />; // Render the child route (e.g., DashboardLayout)
};

export default ProtectedRoute;