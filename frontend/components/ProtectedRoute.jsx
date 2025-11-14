// frontend/src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { userInfo, isLoading } = useAuth();
  const location = useLocation();

  // Wait for the auth check to complete
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Checking authentication...</div>
      </div>
    );
  }

  if (!userInfo) {
    // Redirect to login, saving the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />; // Render the child route (e.g., DashboardLayout)
};

export default ProtectedRoute;