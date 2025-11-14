// frontend/src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/axios';
import { useQuery } from '@tanstack/react-query';

const AuthContext = createContext(null);

// Fetch user data if a cookie is present
const fetchUser = async () => {
  try {
    const { data } = await apiClient.get('/auth/me');
    return data;
  } catch (error) {
    return null; // No valid session
  }
};

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);

  // Use React Query to fetch the user on load
  const { data, isLoading, isError } = useQuery({
    queryKey: ['authUser'],
    queryFn: fetchUser,
    retry: false, // Don't retry on failure
    staleTime: Infinity, // User data is considered fresh
    cacheTime: Infinity,
  });

  // When data is fetched, update the auth state
  useEffect(() => {
    if (data) {
      setUserInfo(data);
    } else if (isError || !isLoading) {
      // If error or done loading with no data, ensure user is logged out
      setUserInfo(null);
    }
  }, [data, isLoading, isError]);

  // Manual login (after form submission)
  const login = (userData) => {
    setUserInfo(userData);
  };

  // Manual logout
  const logout = () => {
    setUserInfo(null);
    // We also need to invalidate the 'authUser' query
    // This will be handled by the Header's logoutMutation
  };

  // Show a loading spinner or splash screen while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading Application...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ userInfo, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};