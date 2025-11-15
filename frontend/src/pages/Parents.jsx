// frontend/src/pages/Parents.jsx

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Search, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

// --- API Functions ---
const fetchParents = async () => {
  const { data } = await apiClient.get('/users/parents'); // <-- Use new route
  return data;
};
const createParent = async (parentData) => {
  const { data } = await apiClient.post('/users/parent', parentData);
  return data;
};

// --- Parent Form ---
const ParentForm = ({ onSuccess }) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const createMutation = useMutation({
    mutationFn: createParent,
    onSuccess: () => {
      toast.success('Parent account created successfully!');
      queryClient.invalidateQueries(['parents']); // <-- Invalidate query
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create account');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({ name, email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Full Name" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input label="Email Address" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input label="Password" id="password" type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <Button type="submit" isLoading={createMutation.isLoading}>
        Create Parent Account
      </Button>
    </form>
  );
};

// --- Main Page Component ---
const Parents = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: parents, isLoading } = useQuery({ 
    queryKey: ['parents'], 
    queryFn: fetchParents 
  });

  const filteredParents = useMemo(() => {
    if (!parents) return [];
    return parents.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [parents, searchTerm]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Parents</h1>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
          <Input 
            type="text" 
            placeholder="Search by name or email..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 py-2 px-4 text-white bg-primary rounded-md shadow-sm hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          <span>Add Parent</span>
        </button>
      </div>

      <div className="bg-surface rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && (
                <tr><td colSpan="4" className="p-4 text-center">Loading...</td></tr>
              )}
              {filteredParents?.map((parent) => (
                <tr key={parent._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{parent.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parent.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(parent.createdAt), 'PP')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-red-600 hover:text-red-900" title="Delete Parent (Coming Soon)" disabled>
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Parent">
        <ParentForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Parents;