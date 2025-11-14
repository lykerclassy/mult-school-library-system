// frontend/src/hooks/useNotificationStore.js

import { create } from 'zustand';
import apiClient from '../api/axios';

const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: true,
  fetchNotifications: async () => {
    try {
      set({ isLoading: true });
      const { data } = await apiClient.get('/notifications');
      const unread = data.filter(n => !n.read).length;
      set({ notifications: data, unreadCount: unread, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({ isLoading: false });
    }
  },
  markAllAsRead: async () => {
    try {
      // Mark as read on the backend
      await apiClient.post('/notifications/mark-read');
      
      // Update state locally
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  },
}));

export default useNotificationStore;