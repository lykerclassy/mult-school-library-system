import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Try to get user info from localStorage on initial load
  const [userInfo, setUserInfo] = useState(() => {
    try {
      const storedUserInfo = localStorage.getItem('userInfo');
      return storedUserInfo ? JSON.parse(storedUserInfo) : null;
    } catch (error) {
      console.error('Failed to parse userInfo from localStorage', error);
      return null;
    }
  });

  // Effect to update localStorage whenever userInfo changes
  useEffect(() => {
    if (userInfo) {
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    } else {
      localStorage.removeItem('userInfo');
    }
  }, [userInfo]);

  // Helper: isAuthenticated
  const isAuthenticated = !!userInfo;

  // Helper: login
  const login = (userData) => {
    setUserInfo(userData);
  };

  // Helper: logout
  const logout = () => {
    setUserInfo(null);
  };

  const value = { userInfo, setUserInfo, isAuthenticated, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to easily use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};