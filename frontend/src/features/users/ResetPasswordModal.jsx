// frontend/src/features/users/ResetPasswordModal.jsx

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const resetUserPassword = async ({ userId, newPassword }) => {
  const { data } = await apiClient.put(`/users/${userId}/reset-password`, { newPassword });
  return data;
};

const ResetPasswordModal = ({ user, onClose }) => {
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: resetUserPassword,
    onSuccess: () => {
      toast.success(`Password reset for ${user.name}`);
      onClose();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ userId: user._id, newPassword: password });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Reset Password for ${user.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="New Password"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min 6 characters"
          required
        />
        <Button type="submit" isLoading={mutation.isLoading} className="w-auto">
          Set New Password
        </Button>
      </form>
    </Modal>
  );
};

export default ResetPasswordModal;