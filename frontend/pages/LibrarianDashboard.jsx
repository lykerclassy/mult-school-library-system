import React from 'react';
import { useAuth } from '../context/AuthContext';

const LibrarianDashboard = () => {
  const { userInfo } = useAuth();
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">
        Librarian Dashboard
      </h1>
      <h2 className="text-xl text-gray-700">
        Welcome, {userInfo.username}!
      </h2>
      <p className="mt-4 text-gray-600">
        This is where you will issue and return books.
      </p>
    </div>
  );
};

export default LibrarianDashboard;