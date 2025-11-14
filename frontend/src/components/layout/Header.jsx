// /frontend/src/components/layout/Header.jsx

import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';
import { User, LogOut } from 'lucide-react';

const Header = () => {
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: () => apiClient.post('/auth/logout'),
    onSuccess: () => {
      logout(); // Clear user info from context and localStorage
      navigate('/login');
      toast.success('Logged out successfully');
    },
    onError: (error) => {
      toast.error('Logout failed. Please try again.');
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="h-16 bg-surface shadow-sm flex items-center justify-between px-6">
      <div>
        {/* We can add a search bar or breadcrumbs here */}
        <h1 className="text-xl font-semibold">
          Welcome, {userInfo?.name || 'User'}
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        {/* User Dropdown Menu (Simplified as a button for now) */}
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isLoading}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>{logoutMutation.isLoading ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;