import React from 'react';
import { useAuth } from '../context/AuthContext';

const SchoolDashboard = () => {
  const { userInfo } = useAuth();
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">
        School Admin Dashboard
      </h1>
      <h2 className="text-xl text-gray-700">
        Welcome, {userInfo.username}!
      </h2>
      <p className="mt-4 text-gray-600">
        This is where you will manage librarians, students, and books for your
        school.
      </p>
    </div>
  );
};

export default SchoolDashboard;