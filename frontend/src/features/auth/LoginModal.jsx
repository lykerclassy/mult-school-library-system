// frontend/src/features/auth/LoginModal.jsx

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';

import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const LoginModal = ({ modalType, isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1 = Email, 2 = Password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userData, setUserData] = useState(null); // Holds { name, schoolName }

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // --- Mutation 1: Check Email ---
  const checkEmailMutation = useMutation({
    mutationFn: (data) => apiClient.post('/auth/check-email', data),
    onSuccess: (data) => {
      setUserData(data.data); // Save user data (name, schoolName)
      setStep(2); // Move to the password step
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Email not found');
    },
  });

  // --- Mutation 2: Final Login ---
  const loginMutation = useMutation({
    mutationFn: (credentials) => apiClient.post('/auth/login', credentials),
    onSuccess: (data) => {
      toast.success('Login successful!');
      login(data.data); // Set user info in context
      navigate(from, { replace: true });
      onClose(); // Close the modal
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Invalid email or password');
    },
  });

  // --- Handlers ---
  const handleNext = (e) => {
    e.preventDefault();
    checkEmailMutation.mutate({ email, role: modalType });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  // --- Close and reset modal state ---
  const handleClose = () => {
    setStep(1);
    setEmail('');
    setPassword('');
    setUserData(null);
    onClose();
  };

  // --- Simple Login (for Admin/Developer) ---
  const handleSimpleLogin = (e) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  // --- Modal Content ---
  const getTitle = () => {
    if (modalType === 'Student') return 'Student Login';
    if (modalType === 'SchoolAdmin') return 'School Admin Login';
    if (modalType === 'Developer') return 'Developer Login';
  };

  // Admin and Developer get a simple form
  if (modalType === 'SchoolAdmin' || modalType === 'Developer') {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title={getTitle()}>
        <form onSubmit={handleSimpleLogin} className="space-y-4">
          <Input
            label="Email Address"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" isLoading={loginMutation.isLoading}>
            Sign In
          </Button>
        </form>
      </Modal>
    );
  }

  // Student gets the multi-step form
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getTitle()}>
      {/* --- Step 1: Email --- */}
      {step === 1 && (
        <form onSubmit={handleNext} className="space-y-4">
          <p className="text-gray-600">
            Please enter your student email to begin.
          </p>
          <Input
            label="Student Email"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" isLoading={checkEmailMutation.isLoading}>
            Next
          </Button>
        </form>
      )}

      {/* --- Step 2: Password --- */}
      {step === 2 && userData && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="p-4 bg-gray-100 rounded-md space-y-2">
            <p>
              <span className="font-medium text-gray-700">Student:</span> {userData.name}
            </p>
            <p>
              <span className="font-medium text-gray-700">School:</span> {userData.schoolName}
            </p>
          </div>
          <Input
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
          />
          <Button type="submit" isLoading={loginMutation.isLoading}>
            Sign In
          </Button>
        </form>
      )}
    </Modal>
  );
};

export default LoginModal;