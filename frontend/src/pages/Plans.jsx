// frontend/src/pages/Plans.jsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import ConfirmationModal from '../components/common/ConfirmationModal';

// --- API Functions ---
const fetchPlans = async () => (await apiClient.get('/plans')).data;
const createPlan = async (data) => (await apiClient.post('/plans', data)).data;
const deletePlan = async (id) => (await apiClient.delete(`/plans/${id}`)).data;

// --- Plan Form Component ---
const PlanForm = () => {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [studentLimit, setStudentLimit] = useState(100);
  const [teacherLimit, setTeacherLimit] = useState(10);
  
  const mutation = useMutation({
    mutationFn: createPlan,
    onSuccess: () => {
      toast.success('Plan created!');
      queryClient.invalidateQueries(['plans']);
      setName(''); setPrice(0); setStudentLimit(100); setTeacherLimit(10);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ name, price: price * 100, studentLimit, teacherLimit });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Create New Plan</h2>
      <Input label="Plan Name" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input label="Price (e.g., 20.00)" id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
      <Input label="Student Limit" id="studentLimit" type="number" value={studentLimit} onChange={(e) => setStudentLimit(e.target.value)} required />
      <Input label="Teacher Limit" id="teacherLimit" type="number" value={teacherLimit} onChange={(e) => setTeacherLimit(e.target.value)} required />
      <Button type="submit" isLoading={mutation.isLoading}>
        Create Plan
      </Button>
    </form>
  );
};

// --- Main Page Component ---
const Plans = () => {
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: fetchPlans,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlan,
    onSuccess: () => {
      toast.success('Plan deleted');
      queryClient.invalidateQueries(['plans']);
      setSelectedPlan(null);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed'),
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <PlanForm />
        </div>
        <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Existing Plans</h2>
          {isLoading && <p>Loading plans...</p>}
          <ul className="space-y-3">
            {plans?.map(plan => (
              <li key={plan._id} className="p-4 border rounded-md flex justify-between items-center">
                <div>
                  <p className="font-semibold text-primary">{plan.name}</p>
                  <p className="text-sm text-gray-600">
                    KES {plan.price / 100} / month | {plan.studentLimit} Students | {plan.teacherLimit} Teachers
                  </p>
                </div>
                <button onClick={() => setSelectedPlan(plan)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <ConfirmationModal
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        onConfirm={() => deleteMutation.mutate(selectedPlan._id)}
        title="Delete Plan"
        message={`Are you sure you want to delete the "${selectedPlan?.name}" plan? This cannot be undone.`}
        isLoading={deleteMutation.isLoading}
      />
    </div>
  );
};

export default Plans;