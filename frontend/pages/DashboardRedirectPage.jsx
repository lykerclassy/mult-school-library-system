import React from 'react';
import { useAuth } from '../context/AuthContext';
import DevDashboard from './DevDashboard';
import SchoolDashboard from './SchoolDashboard';
import LibrarianDashboard from './LibrarianDashboard';

const DashboardRedirectPage = () => {
  const { userInfo } = useAuth();

  if (!userInfo) {
    // This should theoretically be caught by ProtectedRoute,
    // but it's good practice to have a fallback.
    return <p>Loading...</p>;
  }

  // This is our role-based routing
  switch (userInfo.role) {
    case 'DEVELOPER':
      return <DevDashboard />;
    case 'SCHOOL_ADMIN':
      return <SchoolDashboard />;
    case 'LIBRARIAN':
      return <LibrarianDashboard />;
    default:
      return (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            Error: Unknown User Role
          </h1>
          <p>Please contact support.</p>
        </div>
      );
  }
};

export default DashboardRedirectPage;