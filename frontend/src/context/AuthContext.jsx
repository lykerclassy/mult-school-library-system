// frontend/src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const fetchUser = async () => {
  try {
    const { data } = await apiClient.get('/auth/me');
    return data;
  } catch (error) {
    return null; 
  }
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['authUser'],
    queryFn: fetchUser,
    retry: false,
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  useEffect(() => {
    if (data) {
      setUserInfo(data);
    } else if (!isLoading) {
      setUserInfo(null);
    }
  }, [data, isLoading]);

  const login = (userData) => {
    setUserInfo(userData);
    queryClient.setQueryData(['authUser'], userData);
  };

  const logout = () => {
    setUserInfo(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Checking authentication...</div>
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