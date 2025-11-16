// frontend/src/pages/GlobalUsers.jsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import useDebounce from '../hooks/useDebounce';
import Pagination from '../components/common/Pagination';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal'; // <-- IMPORT
import { Search, Edit } from 'lucide-react'; // <-- IMPORT
import ResetPasswordModal from '../features/users/ResetPasswordModal';
import toast from 'react-hot-toast'; // <-- IMPORT

// --- API Functions ---
const fetchAllUsers = async (page, search) => {
  const { data } = await apiClient.get('/users/all', {
    params: { page, search, limit: 10 },
  });
  return data;
};
const changeUserRole = async ({ userId, newRole }) => {
  const { data } = await apiClient.put(`/users/${userId}/change-role`, { newRole });
  return data;
};

// --- NEW COMPONENT: ChangeRoleModal ---
const ChangeRoleModal = ({ user, onClose }) => {
  const queryClient = useQueryClient();
  const [role, setRole] = useState(user.role);
  
  const mutation = useMutation({
    mutationFn: changeUserRole,
    onSuccess: () => {
      toast.success("User role updated!");
      queryClient.invalidateQueries(['allUsers']);
      onClose();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ userId: user._id, newRole: role });
  };
  
  return (
    <Modal isOpen={true} onClose={onClose} title={`Change Role for ${user.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          <option>SchoolAdmin</option>
          <option>Librarian</option>
          <option>Teacher</option>
          <option>Student</option>
          <option>Parent</option>
        </select>
        <Button type="submit" isLoading={mutation.isLoading} className="w-auto">
          Save Role
        </Button>
      </form>
    </Modal>
  );
};


// --- Main Page Component (UPDATED) ---
const GlobalUsers = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [resettingUser, setResettingUser] = useState(null);
  const [changingRoleUser, setChangingRoleUser] = useState(null); // <-- NEW
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['allUsers', page, debouncedSearch],
    queryFn: () => fetchAllUsers(page, debouncedSearch),
    keepPreviousData: true,
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Global User Management</h1>
      
      <div className="relative w-full max-w-md mb-6">
        <Input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      <div className="bg-surface rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && <tr><td colSpan="5" className="p-4 text-center">Loading users...</td></tr>}
              {data?.docs.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.school?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button onClick={() => setChangingRoleUser(user)} className="w-auto text-sm py-1 bg-gray-600 hover:bg-gray-700" title="Change Role">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => setResettingUser(user)} className="w-auto text-sm py-1" title="Reset Password">
                      Reset Password
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data && (
          <Pagination data={data} onPageChange={(newPage) => setPage(newPage)} />
        )}
      </div>

      {resettingUser && (
        <ResetPasswordModal
          user={resettingUser}
          onClose={() => setResettingUser(null)}
        />
      )}
      
      {changingRoleUser && (
        <ChangeRoleModal
          user={changingRoleUser}
          onClose={() => setChangingRoleUser(null)}
        />
      )}
    </div>
  );
};

export default GlobalUsers;