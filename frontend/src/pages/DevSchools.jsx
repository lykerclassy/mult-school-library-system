// frontend/src/pages/DevSchools.jsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Plus, Power, PowerOff, Trash2 } from 'lucide-react'; // <-- IMPORT TRASH
import Button from '../components/common/Button';
import RegisterSchoolModal from '../features/schools/RegisterSchoolModal';
import ManageSchoolModal from '../features/schools/ManageSchoolModal';
import ConfirmationModal from '../components/common/ConfirmationModal';

// --- API Functions ---
const fetchSchools = async () => (await apiClient.get('/schools')).data;
const toggleStatus = async (id) => (await apiClient.put(`/schools/${id}/toggle-status`)).data;
const deleteSchool = async (id) => (await apiClient.delete(`/schools/${id}`)).data; // <-- NEW

// --- Main Page Component ---
const DevSchools = () => {
  const queryClient = useQueryClient();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [managingSchool, setManagingSchool] = useState(null);
  const [togglingSchool, setTogglingSchool] = useState(null);
  const [deletingSchool, setDeletingSchool] = useState(null); // <-- NEW STATE

  const { data: schools, isLoading } = useQuery({
    queryKey: ['schools'],
    queryFn: fetchSchools,
  });

  const toggleMutation = useMutation({
    mutationFn: toggleStatus,
    onSuccess: (data) => {
      toast.success(`School ${data.subscriptionStatus === 'Active' ? 'activated' : 'suspended'}`);
      queryClient.invalidateQueries(['schools']);
      setTogglingSchool(null);
    },
    onError: (error) => toast.error('Failed to update status'),
  });

  // --- NEW DELETE MUTATION ---
  const deleteMutation = useMutation({
    mutationFn: deleteSchool,
    onSuccess: () => {
      toast.success('School has been permanently deleted');
      queryClient.invalidateQueries(['schools']);
      setDeletingSchool(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete school');
    },
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Trialing': return 'bg-blue-100 text-blue-800';
      case 'Overdue': return 'bg-yellow-100 text-yellow-800';
      case 'Canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Schools</h1>
        <Button onClick={() => setIsRegisterOpen(true)} className="w-auto">
          <Plus className="w-5 h-5 mr-1" /> Add New School
        </Button>
      </div>

      <div className="p-6 bg-surface rounded-lg shadow mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Billing</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && <tr><td colSpan="6" className="p-4 text-center">Loading...</td></tr>}
              {schools?.map((school) => (
                <tr key={school._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{school.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.admin?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(school.subscriptionStatus)}`}>
                      {school.subscriptionStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.plan?.name || 'No Plan'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.nextBillingDate ? format(new Date(school.nextBillingDate), 'PP') : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button onClick={() => setManagingSchool(school)} className="w-auto text-sm py-1">
                      Manage
                    </Button>
                    <Button
                      onClick={() => setTogglingSchool(school)}
                      className={`w-auto text-sm py-1 ${school.subscriptionStatus === 'Canceled' ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}
                      title={school.subscriptionStatus === 'Canceled' ? 'Activate' : 'Suspend'}
                    >
                      {school.subscriptionStatus === 'Canceled' ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                    </Button>
                    {/* --- NEW DELETE BUTTON --- */}
                    <Button
                      onClick={() => setDeletingSchool(school)}
                      className="w-auto text-sm py-1 bg-red-600 hover:bg-red-700"
                      title="Delete School"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isRegisterOpen && (
        <RegisterSchoolModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
      )}

      {managingSchool && (
        <ManageSchoolModal school={managingSchool} onClose={() => setManagingSchool(null)} />
      )}

      {togglingSchool && (
        <ConfirmationModal
          isOpen={!!togglingSchool}
          onClose={() => setTogglingSchool(null)}
          onConfirm={() => toggleMutation.mutate(togglingSchool._id)}
          title={togglingSchool.subscriptionStatus === 'Active' ? 'Suspend School' : 'Activate School'}
          message={`Are you sure you want to ${togglingSchool.subscriptionStatus === 'Active' ? 'suspend' : 'activate'} "${togglingSchool.name}"?`}
          isLoading={toggleMutation.isLoading}
        />
      )}
      
      {/* --- NEW DELETE MODAL --- */}
      {deletingSchool && (
        <ConfirmationModal
          isOpen={!!deletingSchool}
          onClose={() => setDeletingSchool(null)}
          onConfirm={() => deleteMutation.mutate(deletingSchool._id)}
          title="DELETE SCHOOL"
          message={`This is permanent and cannot be undone. Are you sure you want to delete "${deletingSchool.name}" and all its users, books, and data?`}
          isLoading={deleteMutation.isLoading}
        />
      )}
    </div>
  );
};

export default DevSchools;