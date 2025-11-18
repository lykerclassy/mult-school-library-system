// frontend/src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

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
  const navigate = useNavigate();

  // This runs once on reload to check if the cookie is valid
  const { data, isLoading } = useQuery({
    queryKey: ['authUser'],
    queryFn: fetchUser,
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!isLoading) {
      setUserInfo(data || null);
    }
  }, [data, isLoading]);

  const login = (userData) => {
    setUserInfo(userData);
    queryClient.setQueryData(['authUser'], userData);
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
      setUserInfo(null);
      queryClient.setQueryData(['authUser'], null);
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Block the app until we know if the user is logged in or not
  if (isLoading) {
    return <LoadingSpinner message="Loading Application..." />;
  }

  return (
    <AuthContext.Provider value={{ userInfo, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};