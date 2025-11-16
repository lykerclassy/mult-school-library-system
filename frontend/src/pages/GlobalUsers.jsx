// frontend/src/pages/GlobalUsers.jsx

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axios';
import useDebounce from '../hooks/useDebounce';
import Pagination from '../components/common/Pagination';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Search } from 'lucide-react';
import ResetPasswordModal from '../features/users/ResetPasswordModal';

// API Function
const fetchAllUsers = async (page, search) => {
  const { data } = await apiClient.get('/users/all', {
    params: { page, search, limit: 10 },
  });
  return data;
};

const GlobalUsers = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button onClick={() => setSelectedUser(user)} className="w-auto text-sm py-1">
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

      {selectedUser && (
        <ResetPasswordModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default GlobalUsers;