// frontend/src/pages/Students.jsx

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

// --- API Functions ---
const fetchStudents = async () => {
  const { data } = await apiClient.get('/students');
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

// --- Student Form (for Add/Edit) ---
const StudentForm = ({ student, onSuccess }) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState(student?.name || '');
  const [admissionNumber, setAdmissionNumber] = useState(
    student?.admissionNumber || ''
  );

  // Determine if we are in 'edit' mode
  const isEditMode = Boolean(student);

  // Mutation for creating a student
  const createMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      toast.success('Student added successfully!');
      queryClient.invalidateQueries(['students']);
      onSuccess(); // Close the modal
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add student');
    },
  });

  // Mutation for updating a student
  const updateMutation = useMutation({
    mutationFn: updateStudent,
    onSuccess: () => {
      toast.success('Student updated successfully!');
      queryClient.invalidateQueries(['students']);
      onSuccess(); // Close the modal
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
      <Input
        label="Student Name"
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
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

// --- Main Page Component ---
const Students = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all students
  const {
    data: students,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['students'],
    queryFn: fetchStudents,
  });

  // Filter students based on search term
  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  // Modal handlers
  const openAddModal = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  if (isLoading) return <div>Loading students...</div>;
  if (isError) return <div>Error loading students.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Manage Students
      </h1>

      {/* Header: Search and Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
          <Input
            type="text"
            placeholder="Search by name or admission..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            aria-hidden="true"
          />
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 py-2 px-4 text-white bg-primary rounded-md shadow-sm hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Students Table */}
      <div className="bg-surface rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Admission No.
                </th>
                {/* --- ADD THIS HEADER --- */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Login Email
                </th>
                {/* --------------------- */}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.admissionNumber}
                  </td>
                  {/* --- ADD THIS CELL --- */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.userAccount?.email || 'N/A'}
                  </td>
                  {/* ------------------- */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button
                      onClick={() => openEditModal(student)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    {/* Delete button (add functionality later) */}
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedStudent ? 'Edit Student' : 'Add New Student'}
      >
        <StudentForm student={selectedStudent} onSuccess={closeModal} />
      </Modal>
    </div>
  );
};

export default Students;