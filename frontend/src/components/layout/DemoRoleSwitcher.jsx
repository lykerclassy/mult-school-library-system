// frontend/src/components/layout/DemoRoleSwitcher.jsx

import React from 'react';
// --- 1. IMPORT useQueryClient AND useNavigate ---
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Users, User, GraduationCap, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

// API Functions
const fetchDemoAccounts = async () => (await apiClient.get('/users/demo-accounts')).data;
const impersonate = async (targetUserId) => (await apiClient.post('/auth/impersonate', { targetUserId })).data;

const DemoRoleSwitcher = () => {
  const { login } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate(); // <-- 2. GET THE NAVIGATE FUNCTION
  
  const { data: accounts, isLoading } = useQuery({
    queryKey: ['demoAccounts'],
    queryFn: fetchDemoAccounts,
  });
  
  const mutation = useMutation({
    mutationFn: impersonate,
    onSuccess: (data) => {
      toast.success(`Now impersonating ${data.name}...`);
      
      // --- 3. THIS IS THE FIX ---
      
      // A. Manually update the React Query cache with the new user data
      queryClient.setQueryData(['authUser'], data);
      
      // B. Manually update the AuthContext
      login(data);
      
      // C. Navigate using React Router (no page reload)
      navigate('/');
      // --- END OF FIX ---
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed'),
  });

  const handleSwitch = (targetId) => {
    if (!targetId) {
      toast.error('This demo account has not been set up yet.');
      return;
    }
    mutation.mutate(targetId);
  };
  
  if (isLoading) return null;

  return (
    <div className="bg-yellow-400 text-yellow-900 p-2 flex items-center justify-center space-x-4">
      <span className="font-bold text-sm hidden md:block">DEMO MODE</span>
      <button 
        onClick={() => handleSwitch(accounts?.teacher?._id)} 
        disabled={mutation.isLoading}
        className="flex items-center space-x-1 hover:bg-yellow-500 p-1 rounded"
      >
        <Users className="w-4 h-4" /> <span className="text-sm">View as Teacher</span>
      </button>
      <button 
        onClick={() => handleSwitch(accounts?.student?._id)}
        disabled={mutation.isLoading}
        className="flex items-center space-x-1 hover:bg-yellow-500 p-1 rounded"
      >
        <GraduationCap className="w-4 h-4" /> <span className="text-sm">View as Student</span>
      </button>
      <button 
        onClick={() => handleSwitch(accounts?.parent?._id)}
        disabled={mutation.isLoading}
        className="flex items-center space-x-1 hover:bg-yellow-500 p-1 rounded"
      >
        <User className="w-4 h-4" /> <span className="text-sm">View as Parent</span>
      </button>
    </div>
  );
};

export default DemoRoleSwitcher;