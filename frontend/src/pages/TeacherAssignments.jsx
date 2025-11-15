// frontend/src/pages/TeacherAssignments.jsx

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import ConfirmationModal from '../components/common/ConfirmationModal'; // <-- IMPORT

// --- API Functions ---
const fetchSubjects = async () => (await apiClient.get('/subjects')).data;
const fetchClassLevels = async () => (await apiClient.get('/classes')).data;
const fetchTeacherAssignments = async () => (await apiClient.get('/assignments/my-assignments')).data;
const createAssignment = async (data) => (await apiClient.post('/assignments', data)).data;
const updateAssignment = async ({ id, ...data }) => (await apiClient.put(`/assignments/${id}`, data)).data; // <-- NEW
const deleteAssignment = async (id) => (await apiClient.delete(`/assignments/${id}`)).data; // <-- NEW

// --- Assignment Form Component (UPDATED) ---
const AssignmentForm = ({ onSuccess, assignment }) => { // <-- Now accepts 'assignment' prop
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [subject, setSubject] = useState('');
  const [classLevel, setClassLevel] = useState('');

  const isEditMode = Boolean(assignment);

  // --- Populate form for editing ---
  useEffect(() => {
    if (isEditMode) {
      setTitle(assignment.title);
      setInstructions(assignment.instructions);
      setDueDate(new Date(assignment.dueDate).toISOString().split('T')[0]);
      setSubject(assignment.subject._id || assignment.subject);
      setClassLevel(assignment.classLevel._id || assignment.classLevel);
    }
  }, [assignment, isEditMode]);

  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: fetchSubjects });
  const { data: classes } = useQuery({ queryKey: ['classLevels'], queryFn: fetchClassLevels });

  const mutation = useMutation({
    mutationFn: isEditMode ? updateAssignment : createAssignment, // <-- Dynamic function
    onSuccess: () => {
      toast.success(`Assignment ${isEditMode ? 'updated' : 'created'}!`);
      queryClient.invalidateQueries(['teacherAssignments']);
      onSuccess();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const assignmentData = { title, instructions, dueDate, subject, classLevel };
    if (isEditMode) {
      mutation.mutate({ id: assignment._id, ...assignmentData });
    } else {
      mutation.mutate(assignmentData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Title" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <textarea
        id="instructions"
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        placeholder="Enter assignment instructions..."
        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
        rows={4}
      />
      <Input label="Due Date" id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
      <select onChange={(e) => setSubject(e.target.value)} value={subject} className="w-full p-2 border rounded-md" required>
        <option value="">Select Subject</option>
        {subjects?.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
      </select>
      <select onChange={(e) => setClassLevel(e.target.value)} value={classLevel} className="w-full p-2 border rounded-md" required>
        <option value="">Select Class</option>
        {classes?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
      </select>
      <Button type="submit" isLoading={mutation.isLoading}>
        {isEditMode ? 'Update Assignment' : 'Create Assignment'}
      </Button>
    </form>
  );
};


// --- Main Page Component (UPDATED) ---
const TeacherAssignments = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null); // For edit or delete
  
  const { data: assignments, isLoading } = useQuery({
    queryKey: ['teacherAssignments'],
    queryFn: fetchTeacherAssignments,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAssignment,
    onSuccess: () => {
      toast.success('Assignment deleted');
      queryClient.invalidateQueries(['teacherAssignments']);
      setIsDeleteModalOpen(false);
      setSelectedAssignment(null);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to delete'),
  });

  // --- Handlers ---
  const openCreateModal = () => {
    setSelectedAssignment(null);
    setIsModalOpen(true);
  };
  const openEditModal = (assignment) => {
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };
  const openDeleteModal = (assignment) => {
    setSelectedAssignment(assignment);
    setIsDeleteModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAssignment(null);
  };
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedAssignment(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Assignments</h1>
        <Button onClick={openCreateModal} className="w-auto">
          <Plus className="w-5 h-5 mr-1" /> Create Assignment
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>}
              {assignments?.map((a) => (
                <tr key={a._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{a.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.classLevel?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.subject?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(a.dueDate), 'PP')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <Link
                      to={`/teacher/assignment/${a._id}/submissions`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Submissions
                    </Link>
                    <button onClick={() => openEditModal(a)} className="text-green-600 hover:text-green-900">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => openDeleteModal(a)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={selectedAssignment ? 'Edit Assignment' : 'Create New Assignment'}
      >
        <AssignmentForm 
          onSuccess={closeModal} 
          assignment={selectedAssignment} 
        />
      </Modal>

      {/* Delete Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() => deleteMutation.mutate(selectedAssignment._id)}
        title="Delete Assignment"
        message={`Are you sure you want to delete "${selectedAssignment?.title}"? This will also delete all student submissions for this assignment.`}
        isLoading={deleteMutation.isLoading}
      />
    </div>
  );
};

export default TeacherAssignments;