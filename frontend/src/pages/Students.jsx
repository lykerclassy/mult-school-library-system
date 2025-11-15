// frontend/src/pages/Students.jsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Search, Edit, Trash2, Link, BookOpen } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import ConfirmationModal from '../components/common/ConfirmationModal';

// --- API Functions ---
const fetchStudents = async (page, search) => (await apiClient.get('/students', { params: { page, search, limit: 10 } })).data;
const createStudent = async (data) => (await apiClient.post('/students', data)).data;
const updateStudent = async ({ id, ...data }) => (await apiClient.put(`/students/${id}`, data)).data;
const deleteStudent = async (id) => (await apiClient.delete(`/students/${id}`)).data;
const fetchParents = async () => (await apiClient.get('/users/parents')).data;
const fetchClassLevels = async () => (await apiClient.get('/classes')).data;

// --- (StudentForm is unchanged) ---
const StudentForm = ({ student, onSuccess }) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState(student?.name || '');
  const [admissionNumber, setAdmissionNumber] = useState(
    student?.admissionNumber || ''
  );
  const isEditMode = Boolean(student);
  const createMutation = useMutation({
    mutationFn: createStudent, onSuccess: () => { toast.success('Student added!'); queryClient.invalidateQueries(['students']); onSuccess(); },
    onError: (error) => { toast.error(error.response?.data?.message || 'Failed to add'); },
  });
  const updateMutation = useMutation({
    mutationFn: updateStudent, onSuccess: () => { toast.success('Student updated!'); queryClient.invalidateQueries(['students']); onSuccess(); },
    onError: (error) => { toast.error(error.response?.data?.message || 'Failed to update'); },
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditMode) { updateMutation.mutate({ id: student._id, name, admissionNumber }); }
    else { createMutation.mutate({ name, admissionNumber }); }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Student Name" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input label="Admission Number" id="admissionNumber" placeholder="Must be 6+ chars" value={admissionNumber} onChange={(e) => setAdmissionNumber(e.target.value)} required />
      <Button type="submit" isLoading={createMutation.isLoading || updateMutation.isLoading}>
        {isEditMode ? 'Update Student' : 'Add Student'}
      </Button>
    </form>
  );
};


// --- LinkParentModal (FIXED) ---
const LinkParentModal = ({ student, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [parentId, setParentId] = useState(student.parent?._id || ''); // Set default

  const { data: parents, isLoading: isLoadingParents } = useQuery({
    queryKey: ['parents'],
    queryFn: fetchParents, // Use the correct, new API
  });

  const linkMutation = useMutation({
    mutationFn: (newParentId) => apiClient.put(`/students/${student._id}/link-parent`, { parentId: newParentId }),
    onSuccess: () => {
      toast.success('Parent linked successfully!');
      queryClient.invalidateQueries(['students']);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to link parent');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    linkMutation.mutate(parentId);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Link Parent to ${student.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          onChange={(e) => setParentId(e.target.value)}
          value={parentId}
          className="w-full p-2 border rounded-md"
          required
        >
          <option value="">{isLoadingParents ? 'Loading parents...' : 'Select a Parent'}</option>
          {parents?.map(p => (
            <option key={p._id} value={p._id}>{p.name} ({p.email})</option>
          ))}
        </select>
        <Button type="submit" isLoading={linkMutation.isLoading}>
          Link Parent
        </Button>
      </form>
    </Modal>
  );
};

// --- NEW COMPONENT: AssignClassModal ---
const AssignClassModal = ({ student, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [classId, setClassId] = useState(student.classLevel?._id || '');

  const { data: classes, isLoading: isLoadingClasses } = useQuery({
    queryKey: ['classLevels'],
    queryFn: fetchClassLevels,
  });

  const linkMutation = useMutation({
    mutationFn: (newClassId) => apiClient.put(`/students/${student._id}/assign-class`, { classId: newClassId }),
    onSuccess: () => {
      toast.success('Class assigned successfully!');
      queryClient.invalidateQueries(['students']);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to assign class');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    linkMutation.mutate(classId);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Assign Class for ${student.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          onChange={(e) => setClassId(e.target.value)}
          value={classId}
          className="w-full p-2 border rounded-md"
          required
        >
          <option value="">{isLoadingClasses ? 'Loading classes...' : 'Select a Class'}</option>
          {classes?.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <Button type="submit" isLoading={linkMutation.isLoading}>
          Assign Class
        </Button>
      </form>
    </Modal>
  );
};


// --- Main Page Component (UPDATED) ---
const Students = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false); // <-- New State
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

  const openAddModal = () => { setSelectedStudent(null); setIsModalOpen(true); };
  const openEditModal = (student) => { setSelectedStudent(student); setIsModalOpen(true); };
  const openDeleteModal = (student) => { setSelectedStudent(student); setIsDeleteModalOpen(true); };
  const openLinkModal = (student) => { setSelectedStudent(student); setIsLinkModalOpen(true); };
  const openClassModal = (student) => { setSelectedStudent(student); setIsClassModalOpen(true); }; // <-- New

  const closeModal = () => { setIsModalOpen(false); setSelectedStudent(null); };
  const closeDeleteModal = () => { setIsDeleteModalOpen(false); setSelectedStudent(null); };
  const closeLinkModal = () => { setIsLinkModalOpen(false); setSelectedStudent(null); };
  const closeClassModal = () => { setIsClassModalOpen(false); setSelectedStudent(null); }; // <-- New

  if (isError) return <div>Error loading students.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Students</h1>
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
          <Input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <button onClick={openAddModal} className="flex items-center space-x-2 py-2 px-4 text-white bg-primary rounded-md shadow-sm hover:bg-blue-700">
          <Plus className="w-5 h-5" /><span>Add Student</span>
        </button>
      </div>

      <div className="bg-surface rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.classLevel ? student.classLevel.name : (
                      <button onClick={() => openClassModal(student)} className="text-xs text-blue-600 hover:underline">
                        Assign Class
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.parent ? student.parent.name : (
                      <button onClick={() => openLinkModal(student)} className="text-xs text-blue-600 hover:underline">
                        Link Parent
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button onClick={() => openClassModal(student)} className="text-gray-500 hover:text-green-700" title="Assign Class">
                      <BookOpen className="w-5 h-5" />
                    </button>
                    <button onClick={() => openLinkModal(student)} className="text-gray-500 hover:text-blue-700" title="Link Parent">
                      <Link className="w-5 h-5" />
                    </button>
                    <button onClick={() => openEditModal(student)} className="text-blue-600 hover:text-blue-900" title="Edit Student">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => openDeleteModal(student)} className="text-red-600 hover:text-red-900" title="Delete Student">
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

      {/* Modals */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={selectedStudent ? 'Edit Student' : 'Add New Student'}>
        <StudentForm student={selectedStudent} onSuccess={closeModal} />
      </Modal>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() => deleteMutation.mutate(selectedStudent._id)}
        title="Delete Student"
        message={`Are you sure you want to delete "${selectedStudent?.name}"?`}
        isLoading={deleteMutation.isLoading}
      />
      {isLinkModalOpen && (
        <LinkParentModal
          student={selectedStudent}
          onClose={closeLinkModal}
          onSuccess={closeLinkModal}
        />
      )}
      {isClassModalOpen && (
        <AssignClassModal
          student={selectedStudent}
          onClose={closeClassModal}
          onSuccess={closeClassModal}
        />
      )}
    </div>
  );
};

export default Students;