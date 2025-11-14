// frontend/src/pages/Staff.jsx

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import ConfirmationModal from '../components/common/ConfirmationModal'; // <-- IMPORT

// --- API Functions ---
const fetchStaff = async () => {
  const { data } = await apiClient.get('/users/staff');
  return data;
};

const createLibrarian = async (staffData) => {
  const { data } = await apiClient.post('/users/staff', staffData);
  return data;
};

// --- NEW DELETE FUNCTION ---
const deleteStaff = async (id) => {
  const { data } = await apiClient.delete(`/users/staff/${id}`);
  return data;
};

// --- (StaffForm is unchanged) ---
const StaffForm = ({ onSuccess }) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const createMutation = useMutation({
    mutationFn: createLibrarian,
    onSuccess: () => {
      toast.success('Librarian account created successfully!');
      queryClient.invalidateQueries(['staff']);
      onSuccess(); // Close the modal
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create account');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({ name, email, password, role: 'Librarian' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Full Name" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input label="Email Address" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input label="Password" id="password" type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <Button type="submit" isLoading={createMutation.isLoading}>
        Create Librarian Account
      </Button>
    </form>
  );
};


// --- Main Page Component (UPDATED) ---
const Staff = () => {
  const queryClient = useQueryClient(); // <-- Get Query Client
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // <-- New State
  const [selectedStaff, setSelectedStaff] = useState(null); // <-- New State
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: staff,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['staff'],
    queryFn: fetchStaff,
  });

  // --- New Delete Mutation ---
  const deleteMutation = useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => {
      toast.success('Staff member deleted');
      queryClient.invalidateQueries(['staff']);
      setIsDeleteModalOpen(false);
      setSelectedStaff(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete staff');
    },
  });

  const filteredStaff = useMemo(() => {
    if (!staff) return [];
    return staff.filter(
      (person) =>
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [staff, searchTerm]);

  const openDeleteModal = (staffMember) => { // <-- New Handler
    setSelectedStaff(staffMember);
    setIsDeleteModalOpen(true);
  };
  const closeDeleteModal = () => { // <-- New Handler
    setIsDeleteModalOpen(false);
    setSelectedStaff(null);
  };

  if (isLoading) return <div>Loading staff...</div>;
  if (isError) return <div>Error loading staff.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Staff</h1>

      {/* Header (unchanged) */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
          <Input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 py-2 px-4 text-white bg-primary rounded-md shadow-sm hover:bg-blue-700">
          <Plus className="w-5 h-5" />
          <span>Add Librarian</span>
        </button>
      </div>

      {/* Staff Table (updated) */}
      <div className="bg-surface rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* ... (thead is unchanged) ... */}
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStaff.map((person) => (
                <tr key={person._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{person.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        person.role === 'SchoolAdmin'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {person.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(person.createdAt), 'PP')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button
                      className="text-blue-600 hover:text-blue-900 opacity-30"
                      title="Edit (coming soon)"
                      disabled
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    {/* --- DELETE BUTTON IS NOW WIRED --- */}
                    <button
                      onClick={() => openDeleteModal(person)}
                      className="text-red-600 hover:text-red-900"
                      disabled={person.role === 'SchoolAdmin'} // Disable deleting the main admin
                      title={person.role === 'SchoolAdmin' ? "Cannot delete main admin" : "Delete user"}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal (unchanged) */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Librarian">
        <StaffForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>

      {/* --- NEW DELETE MODAL --- */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() => deleteMutation.mutate(selectedStaff._id)}
        title="Delete Staff Member"
        message={`Are you sure you want to delete "${selectedStaff?.name}"? This action cannot be undone.`}
        isLoading={deleteMutation.isLoading}
      />
    </div>
  );
};

export default Staff;