// frontend/src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();
  
  // We remove the 'location.state.from' logic.
  // This prevents the "stale redirect" bug when switching roles.

  const mutation = useMutation({
    mutationFn: (credentials) => apiClient.post('/auth/login', credentials),
    onSuccess: (data) => {
      toast.success('Login successful!');
      login(data.data);
      
      // --- THIS IS THE FIX ---
      // Always redirect to root ('/').
      // The App.jsx router will automatically detect the user's role
      // and route them to the correct Dashboard (Dev, Admin, or Student).
      navigate('/', { replace: true });
      // --- END OF FIX ---
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Invalid email or password');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ email, password });
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen lg:overflow-hidden bg-gray-100">
      
      {/* --- The Image Side --- */}
      <div className="relative h-40 w-full lg:h-full lg:w-1/2 flex-shrink-0">
        <img 
          className="absolute inset-0 object-cover w-full h-full" 
          src="/login-background.png"
          alt="Students in a library" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6 z-10">
          <h1 className="text-2xl lg:text-4xl font-bold text-white">
            Welcome Back.
          </h1>
        </div>
      </div>

      {/* --- The Form Side --- */}
      <div className="flex-1 flex flex-col items-center justify-start lg:justify-center p-6 py-6 overflow-y-auto">
        <div className="w-full max-w-md">
          
          <div className="flex justify-center my-4">
            <img 
              src="/ScholarlyFlow-logo.png"
              alt="ScholarlyFlow Logo" 
              className="h-16 lg:h-20"
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-center text-gray-900">
              Sign in to your account
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Email Address"
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <Button type="submit" isLoading={mutation.isLoading}>
              Sign In
            </Button>
          </form>

          <p className="text-sm text-center text-gray-600 mt-6">
            Are you a Developer?{' '}
            <Link
              to="/register-developer"
              className="font-medium text-primary hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;