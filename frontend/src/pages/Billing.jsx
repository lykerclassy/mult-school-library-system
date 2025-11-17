// frontend/src/pages/Billing.jsx

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import { Check, Star, Loader2, CheckCircle, XCircle } from 'lucide-react';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

// --- API Functions ---
const fetchPlans = async () => (await apiClient.get('/plans')).data;
const fetchMyProfile = async () => (await apiClient.get('/schools/profile')).data;
const initiatePayment = async (data) => (await apiClient.post('/billing/initiate-payment', data)).data;
const checkPaymentStatus = async (paymentId) => (await apiClient.get(`/billing/status/${paymentId}`)).data;

// --- Plan Card Component ---
const PlanCard = ({ plan, isCurrent, onSelect }) => {
  return (
    <div className={`border rounded-lg p-6 ${isCurrent ? 'border-primary' : 'bg-white'}`}>
      <h3 className="text-xl font-semibold text-primary">{plan.name}</h3>
      <p className="text-3xl font-bold my-2">
        KES {plan.price / 100} <span className="text-sm font-normal text-gray-500">/ month</span>
      </p>
      <ul className="space-y-2 text-gray-600 mt-4">
        <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" />{plan.studentLimit} Students</li>
        <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" />{plan.teacherLimit} Staff</li>
        <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" />Full Library Access</li>
        <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" />Quiz & Assignment Tools</li>
      </ul>
      <Button
        onClick={() => onSelect(plan)}
        disabled={isCurrent}
        className={`w-full mt-6 ${isCurrent ? 'bg-gray-400 cursor-not-allowed' : ''}`}
      >
        {isCurrent ? 'Current Plan' : 'Upgrade'}
      </Button>
    </div>
  );
};

// --- Payment Modal ---
const PaymentModal = ({ plan, onClose, onSuccess }) => {
  const [phone, setPhone] = useState('');
  const [paymentId, setPaymentId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('Idle');
  
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: initiatePayment,
    onSuccess: (data) => {
      toast.success(data.message || 'STK push sent. Please check your phone.');
      setPaymentId(data.paymentId);
      setPaymentStatus('Pending');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed'),
  });

  // --- Robust Polling Logic ---
  useQuery({
    queryKey: ['paymentStatus', paymentId],
    queryFn: () => checkPaymentStatus(paymentId),
    enabled: paymentStatus === 'Pending' && !!paymentId,
    refetchInterval: (data) => {
      if (data?.status === 'Completed' || data?.status === 'Failed') {
        return false; // Stop polling
      }
      return 3000; // Continue every 3s
    },
    staleTime: 1000,
    onSuccess: (data) => {
      if (data.status === 'Completed') {
        setPaymentStatus('Completed');
        toast.success('Payment successful! Your plan is now active.');
        queryClient.invalidateQueries({ queryKey: ['schoolProfile'] });
        queryClient.invalidateQueries({ queryKey: ['devAnalytics'] });
        onSuccess();
      } else if (data.status === 'Failed') {
        setPaymentStatus('Failed');
        toast.error('Payment failed. Please try again.');
      }
    },
    onError: () => {
      toast.error('Connection issue checking status. Retrying...');
    },
  });

  // --- Timeout Logic ---
  useEffect(() => {
    let timer;
    if (paymentStatus === 'Pending') {
      timer = setTimeout(() => {
        if (paymentStatus === 'Pending') {
          setPaymentStatus('Failed');
          toast.error('Payment timed out. Please try again.');
        }
      }, 90000); // 90 seconds
    }
    return () => clearTimeout(timer);
  }, [paymentStatus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ planId: plan._id, phoneNumber: phone });
  };

  // --- Show UI based on status ---

  if (paymentStatus === 'Completed') {
    return (
      <Modal isOpen={true} onClose={onClose} title="Payment Successful!">
        <div className="flex flex-col items-center text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold">Thank You!</h3>
          <p className="text-gray-600 mt-2">
            Your payment for the <strong>{plan.name}</strong> plan was successful. Your account has been upgraded.
          </p>
          <Button onClick={onClose} className="w-auto mt-6">
            Done
          </Button>
        </div>
      </Modal>
    );
  }

  if (paymentStatus === 'Failed') {
    return (
      <Modal isOpen={true} onClose={onClose} title="Payment Failed">
        <div className="flex flex-col items-center text-center">
          <XCircle className="w-16 h-16 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold">Payment Failed</h3>
          <p className="text-gray-600 mt-2">
            Your payment could not be completed or it timed out. Please try again.
          </p>
          <Button onClick={onClose} className="w-auto mt-6">
            Try Again
          </Button>
        </div>
      </Modal>
    );
  }

  if (paymentStatus === 'Pending') {
    return (
      <Modal isOpen={true} onClose={onClose} title="Processing Payment...">
        <div className="flex flex-col items-center text-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
          <h3 className="text-xl font-semibold">Awaiting Confirmation</h3>
          <p className="text-gray-600 mt-2">
            STK push sent to <strong>{phone}</strong>.
          </p>
          <p className="text-gray-600 mt-1">
            Please complete the payment on your phone. This window will update automatically.
          </p>
        </div>
      </Modal>
    );
  }

  // Default "Idle" state
  return (
    <Modal isOpen={true} onClose={onClose} title={`Upgrade to ${plan.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p>You are about to subscribe to the <strong>{plan.name}</strong> plan for <strong>KES {plan.price / 100}</strong>.</p>
        <Input
          label="M-Pesa Phone Number"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 254712345678"
          required
        />
        <Button type="submit" isLoading={mutation.isLoading}>
          Pay KES {plan.price / 100}
        </Button>
      </form>
    </Modal>
  );
};

// --- Main Page ---
const Billing = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const queryClient = useQueryClient();
  
  const { data: plans, isLoading: l1 } = useQuery({ queryKey: ['plans'], queryFn: fetchPlans });
  const { data: school, isLoading: l2 } = useQuery({ queryKey: ['schoolProfile'], queryFn: fetchMyProfile });

  if (l1 || l2) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Subscription & Billing</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans?.map(plan => (
          <PlanCard
            key={plan._id}
            plan={plan}
            isCurrent={school?.plan?._id === plan._id}
            onSelect={setSelectedPlan}
          />
        ))}
      </div>

      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['schoolProfile'] });
          }}
        />
      )}
    </div>
  );
};

export default Billing;