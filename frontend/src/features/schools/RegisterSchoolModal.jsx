// frontend/src/features/schools/RegisterSchoolModal.jsx

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const registerSchool = async (schoolData) => {
  const { data } = await apiClient.post('/schools/register', schoolData);
  return data;
};

const RegisterSchoolModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolAddress: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });

  const mutation = useMutation({
    mutationFn: registerSchool,
    onSuccess: () => {
      toast.success('School registered successfully!');
      queryClient.invalidateQueries(['schools']);
      onClose(); // Close the modal
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.message || 'Registration failed';
      toast.error(errorMsg);
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register New School">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="School Name" id="schoolName" value={formData.schoolName} onChange={handleChange} required />
          <Input label="School Address" id="schoolAddress" value={formData.schoolAddress} onChange={handleChange} />
        </div>
        <hr />
        <h3 className="text-lg font-medium text-gray-700">School Admin Account</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Admin Name" id="adminName" value={formData.adminName} onChange={handleChange} required />
          <Input label="Admin Email" id="adminEmail" type="email" value={formData.adminEmail} onChange={handleChange} required />
        </div>
        <Input label="Admin Password" id="adminPassword" type="password" value={formData.adminPassword} required />
        <div className="pt-2">
          <Button type="submit" isLoading={mutation.isLoading}>
            Register School
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RegisterSchoolModal;