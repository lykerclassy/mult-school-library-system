// frontend/src/pages/DevDashboard.jsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { format } from 'date-fns';
import ManageSchoolModal from '../features/schools/ManageSchoolModal'; // <-- IMPORT MODAL

// --- React Query Functions ---
const fetchSchools = async () => {
  const { data } = await apiClient.get('/schools');
  return data;
};
const registerSchool = async (schoolData) => {
  const { data } = await apiClient.post('/schools/register', schoolData);
  return data;
};

// --- (RegisterSchoolForm component is unchanged) ---
const RegisterSchoolForm = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolAddress: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });

  const mutation = useMutation({
    mutationFn: registerSchool,
    onSuccess: () => {
      toast.success('School registered successfully!');
      queryClient.invalidateQueries(['schools']);
      setFormData({
        schoolName: '',
        schoolAddress: '',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
      });
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.message || 'Registration failed';
      toast.error(errorMsg);
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-surface rounded-lg shadow space-y-4"
    >
      <h2 className="text-xl font-semibold text-gray-800">
        Register New School
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="School Name"
          id="schoolName"
          value={formData.schoolName}
          onChange={handleChange}
          required
        />
        <Input
          label="School Address"
          id="schoolAddress"
          value={formData.schoolAddress}
          onChange={handleChange}
        />
      </div>
      <hr className="my-4" />
      <h3 className="text-lg font-medium text-gray-700">
        School Admin Account
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Admin Name"
          id="adminName"
          value={formData.adminName}
          onChange={handleChange}
          required
        />
        <Input
          label="Admin Email"
          id="adminEmail"
          type="email"
          value={formData.adminEmail}
          onChange={handleChange}
          required
        />
      </div>
      <Input
        label="Admin Password"
        id="adminPassword"
        type="password"
        value={formData.adminPassword}
        required
      />
      <div className="pt-2">
        <Button type="submit" isLoading={mutation.isLoading}>
          Register School
        </Button>
      </div>
    </form>
  );
};

// --- List of all schools (UPDATED) ---
const SchoolList = ({ onManageClick }) => {
  const {
    data: schools,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['schools'],
    queryFn: fetchSchools,
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Trialing':
        return 'bg-blue-100 text-blue-800';
      case 'Overdue':
        return 'bg-yellow-100 text-yellow-800';
      case 'Canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) return <div>Loading schools...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div className="p-6 bg-surface rounded-lg shadow mt-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Managed Schools
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Billing</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {schools.map((school) => (
              <tr key={school._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {school.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {school.admin?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(school.subscriptionStatus)}`}>
                    {school.subscriptionStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {school.plan?.name || 'No Plan'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {school.nextBillingDate ? format(new Date(school.nextBillingDate), 'PP') : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    onClick={() => onManageClick(school)}
                    className="w-auto text-sm py-1"
                  >
                    Manage
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Main Page Component (UPDATED) ---
const DevDashboard = () => {
  const [managingSchool, setManagingSchool] = useState(null);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Developer Portal
      </h1>
      <RegisterSchoolForm />
      <SchoolList onManageClick={setManagingSchool} />
      
      {managingSchool && (
        <ManageSchoolModal
          school={managingSchool}
          onClose={() => setManagingSchool(null)}
        />
      )}
    </div>
  );
};

export default DevDashboard;