// frontend/src/features/schools/ManageSchoolModal.jsx

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

// API Functions
const fetchPlans = async () => (await apiClient.get('/plans')).data;
const assignPlan = async ({ schoolId, planData }) => {
  const { data } = await apiClient.put(`/schools/${schoolId}/assign-plan`, planData);
  return data;
};

const ManageSchoolModal = ({ school, onClose }) => {
  const queryClient = useQueryClient();
  
  // Form State
  const [planId, setPlanId] = useState(school?.plan?._id || '');
  const [status, setStatus] = useState(school?.subscriptionStatus || 'Trialing');
  const [nextBillingDate, setNextBillingDate] = useState('');

  // --- THIS IS THE FIX ---
  // The useEffect was missing the 'school' dependency and had a bad date format
  useEffect(() => {
    if (school?.nextBillingDate) {
      // Format the date to 'YYYY-MM-DD' for the <input type="date">
      const formattedDate = new Date(school.nextBillingDate).toISOString().split('T')[0];
      setNextBillingDate(formattedDate);
    }
  }, [school]); // <-- It must run when 'school' loads
  // --- END OF FIX ---

  // Fetch all available plans for the dropdown
  const { data: plans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['plans'],
    queryFn: fetchPlans,
  });

  // Mutation to update the school's plan
  const mutation = useMutation({
    mutationFn: assignPlan,
    onSuccess: () => {
      toast.success('School subscription updated!');
      queryClient.invalidateQueries(['schools']); // Refetch the school list
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update plan');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      schoolId: school._id,
      planData: {
        planId: planId || null,
        subscriptionStatus: status,
        nextBillingDate: nextBillingDate || null,
      },
    });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Manage: ${school.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Plan Selector */}
        <div>
          <label htmlFor="plan" className="block text-sm font-medium text-gray-700">Subscription Plan</label>
          <select
            id="plan"
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
          >
            <option value="">{isLoadingPlans ? 'Loading...' : 'Select a Plan'}</option>
            {plans?.map(p => (
              <option key={p._id} value={p._id}>{p.name} (KES {p.price / 100})</option>
            ))}
          </select>
        </div>

        {/* Status Selector */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Subscription Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
          >
            <option>Trialing</option>
            <option>Active</option>
            <option>Overdue</option>
            <option>Canceled</option>
          </select>
        </div>

        {/* Next Billing Date */}
        <Input
          label="Next Billing Date"
          id="nextBillingDate"
          type="date"
          value={nextBillingDate}
          onChange={(e) => setNextBillingDate(e.target.value)}
        />
        
        <Button type="submit" isLoading={mutation.isLoading}>
          Save Changes
        </Button>
      </form>
    </Modal>
  );
};

export default ManageSchoolModal;