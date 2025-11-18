// frontend/src/pages/ClassDetails.jsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import { Trash2, Plus } from 'lucide-react';
import Button from '../components/common/Button';

// --- API Functions ---
const fetchClass = async (id) => (await apiClient.get(`/classes/${id}`)).data;
const fetchEnrolledStudents = async (id) => (await apiClient.get(`/students/class/${id}`)).data;
const fetchUnassignedStudents = async () => (await apiClient.get('/students/unassigned')).data;
const assignStudent = async ({ studentId, classId }) => (await apiClient.put(`/students/${studentId}/assign-class`, { classId })).data;
const unassignStudent = async (studentId) => (await apiClient.put(`/students/${studentId}/unassign-class`)).data;

// --- Add Student Form ---
const AddStudentForm = ({ classId, onStudentAdded }) => {
  const [selectedStudent, setSelectedStudent] = useState('');
  
  const { data: students, isLoading } = useQuery({
    queryKey: ['unassignedStudents'],
    queryFn: fetchUnassignedStudents,
  });

  const mutation = useMutation({
    mutationFn: assignStudent,
    onSuccess: () => {
      toast.success('Student added to class');
      setSelectedStudent('');
      onStudentAdded(); // Triggers a refetch
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ studentId: selectedStudent, classId });
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <select
        value={selectedStudent}
        onChange={(e) => setSelectedStudent(e.target.value)}
        className="w-full flex-1 p-2 border rounded-md"
      >
        <option value="">{isLoading ? 'Loading...' : 'Select an unassigned student'}</option>
        {students?.map(s => (
          <option key={s._id} value={s._id}>{s.name} ({s.admissionNumber})</option>
        ))}
      </select>
      <Button type="submit" isLoading={mutation.isLoading} className="w-auto">
        <Plus className="w-5 h-5 mr-1" /> Add
      </Button>
    </form>
  );
};

// --- Main Page Component ---
const ClassDetails = () => {
  const { id } = useParams(); // This is the classId
  const queryClient = useQueryClient();

  // 1. Fetch class details
  const { data: classLevel, isLoading: isLoadingClass } = useQuery({
    queryKey: ['class', id],
    queryFn: () => fetchClass(id),
  });

  // 2. Fetch enrolled students
  const { data: enrolledStudents, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['enrolledStudents', id],
    queryFn: () => fetchEnrolledStudents(id),
  });

  // 3. Unassign student mutation
  const unassignMutation = useMutation({
    mutationFn: unassignStudent,
    onSuccess: () => {
      toast.success('Student removed from class');
      // Refetch both lists
      queryClient.invalidateQueries(['enrolledStudents', id]);
      queryClient.invalidateQueries(['unassignedStudents']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  if (isLoadingClass || isLoadingStudents) return <div>Loading class details...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Manage Class: {classLevel?.name}
      </h1>

      {/* Add Student Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-3">Add Student to Class</h2>
        <AddStudentForm 
          classId={id} 
          onStudentAdded={() => {
            queryClient.invalidateQueries(['enrolledStudents', id]);
            queryClient.invalidateQueries(['unassignedStudents']);
          }}
        />
      </div>

      {/* Enrolled Students List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3">Enrolled Students ({enrolledStudents?.length})</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {enrolledStudents?.map(s => (
                <tr key={s._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{s.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{s.admissionNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{s.parent?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => unassignMutation.mutate(s._id)}
                      className="text-red-600 hover:text-red-900"
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
    </div>
  );
};

export default ClassDetails;