// /frontend/src/components/layout/Header.jsx

import React, { useState, useEffect } from 'react';
// --- 1. IMPORT useQueryClient ---
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';
import { User, LogOut, Menu, Bell, CheckCheck } from 'lucide-react';
import useSidebarStore from '../../hooks/useSidebar';
import useNotificationStore from '../../hooks/useNotificationStore';
import { formatDistanceToNow } from 'date-fns';

// --- (NotificationDropdown component is unchanged) ---
const NotificationDropdown = () => {
  const { notifications, unreadCount, markAllAsRead } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4 flex justify-between items-center border-b">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary font-medium hover:underline flex items-center"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-center p-4">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n._id}
                  to={n.link}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 border-b hover:bg-gray-50 ${
                    !n.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <p className="text-sm text-gray-700">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};


// --- Main Header Component (FIXED) ---
const Header = () => {
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebarStore();
  
  // --- 2. GET THE QUERY CLIENT ---
  const queryClient = useQueryClient();
  
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  useEffect(() => {
    if (userInfo) {
      fetchNotifications();
    }
  }, [userInfo, fetchNotifications]);

  const logoutMutation = useMutation({
    mutationFn: () => apiClient.post('/auth/logout'),
    onSuccess: () => {
      logout(); // 1. Clear local context state
      
      // --- 3. THIS IS THE FIX ---
      // This tells React Query to completely clear the 'authUser' cache.
      // The AuthContext will re-run fetchUser, which will fail (no cookie)
      // and successfully log you out.
      queryClient.removeQueries({ queryKey: ['authUser'] });
      // --- END OF FIX ---
      
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
    <header className="h-16 bg-surface shadow-sm flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100 md:hidden mr-2"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold hidden md:block">
          Welcome, {userInfo?.name || 'User'}
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <NotificationDropdown />
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isLoading}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden md:inline">
            {logoutMutation.isLoading ? 'Logging out...' : 'Logout'}
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;