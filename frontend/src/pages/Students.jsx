// frontend/src/pages/Students.jsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import ConfirmationModal from '../components/common/ConfirmationModal'; // <-- IMPORT

// --- API Functions ---
const fetchStudents = async (page, search) => {
  const { data } = await apiClient.get('/students', {
    params: { page, search, limit: 10 },
  });
  return data;
};

const createStudent = async (studentData) => {
  const { data } = await apiClient.post('/students', studentData);
  return data;
};
const updateStudent = async ({ id, ...studentData }) => {
  const { data } = await apiClient.put(`/students/${id}`, studentData);
  return data;
};

// --- NEW DELETE FUNCTION ---
const deleteStudent = async (id) => {
  const { data } = await apiClient.delete(`/students/${id}`);
  return data;
};

// --- (StudentForm is unchanged) ---
const StudentForm = ({ student, onSuccess }) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState(student?.name || '');
  const [admissionNumber, setAdmissionNumber] = useState(
    student?.admissionNumber || ''
  );
  const isEditMode = Boolean(student);
  const createMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      toast.success('Student added successfully!');
      queryClient.invalidateQueries(['students']);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add student');
    },
  });
  const updateMutation = useMutation({
    mutationFn: updateStudent,
    onSuccess: () => {
      toast.success('Student updated successfully!');
      queryClient.invalidateQueries(['students']);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update student');
    },
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditMode) {
      updateMutation.mutate({ id: student._id, name, admissionNumber });
    } else {
      createMutation.mutate({ name, admissionNumber });
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Student Name" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input
        label="Admission Number"
        id="admissionNumber"
        placeholder="Must be at least 6 characters"
        value={admissionNumber}
        onChange={(e) => setAdmissionNumber(e.target.value)}
        required
      />
      <Button
        type="submit"
        isLoading={createMutation.isLoading || updateMutation.isLoading}
      >
        {isEditMode ? 'Update Student' : 'Add Student'}
      </Button>
    </form>
  );
};


// --- Main Page Component (UPDATED) ---
const Students = () => {
  const queryClient = useQueryClient(); // <-- Get Query Client
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // <-- New State
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const {
    data: studentsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['students', page, debouncedSearch],
    queryFn: () => fetchStudents(page, debouncedSearch),
    keepPreviousData: true,
  });

  // --- New Delete Mutation ---
  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => {
      toast.success('Student deleted successfully');
      queryClient.invalidateQueries(['students']);
      setIsDeleteModalOpen(false);
      setSelectedStudent(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete student');
    },
  });

  const openAddModal = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };
  const openEditModal = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };
  const openDeleteModal = (student) => { // <-- New handler
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };
  const closeDeleteModal = () => { // <-- New handler
    setIsDeleteModalOpen(false);
    setSelectedStudent(null);
  };

  if (isError) return <div>Error loading students.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Manage Students
      </h1>

      {/* Header (unchanged) */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
          <Input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <button onClick={openAddModal} className="flex items-center space-x-2 py-2 px-4 text-white bg-primary rounded-md shadow-sm hover:bg-blue-700">
          <Plus className="w-5 h-5" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Table (updated) */}
      <div className="bg-surface rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* ... (thead is unchanged) ... */}
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Login Email</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && (
                <tr><td colSpan="4" className="p-4 text-center">Loading...</td></tr>
              )}
              {!isLoading && studentsData.docs.map((student) => (
                <tr key={student._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.admissionNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.userAccount?.email || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button onClick={() => openEditModal(student)} className="text-blue-600 hover:text-blue-900">
                      <Edit className="w-5 h-5" />
                    </button>
                    {/* --- DELETE BUTTON IS NOW WIRED --- */}
                    <button onClick={() => openDeleteModal(student)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {studentsData && (
          <Pagination data={studentsData} onPageChange={(newPage) => setPage(newPage)} />
        )}
      </div>

      {/* Add/Edit Modal (unchanged) */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={selectedStudent ? 'Edit Student' : 'Add New Student'}>
        <StudentForm student={selectedStudent} onSuccess={closeModal} />
      </Modal>

      {/* --- NEW DELETE MODAL --- */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() => deleteMutation.mutate(selectedStudent._id)}
        title="Delete Student"
        message={`Are you sure you want to delete "${selectedStudent?.name}"? This will also delete their login account and cannot be undone.`}
        isLoading={deleteMutation.isLoading}
      />
    </div>
  );
};

export default Students;