// frontend/src/pages/AdminSupport.jsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';

// --- API Functions ---
const fetchMyTickets = async () => (await apiClient.get('/comm/support-tickets/my-tickets')).data;
const createTicket = async (data) => (await apiClient.post('/comm/support-tickets', data)).data;

const getStatusColor = (status) => {
  if (status === 'Open') return 'bg-red-100 text-red-800';
  if (status === 'In Progress') return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
};

// --- New Ticket Form ---
const NewTicketForm = ({ onSuccess, onClose }) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technical');
  const [message, setMessage] = useState('');

  const mutation = useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      toast.success('Support ticket created!');
      queryClient.invalidateQueries(['myTickets']);
      onSuccess();
      onClose();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ title, category, message });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Subject / Title"
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Cannot upload student list"
        required
      />
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
        >
          <option>Technical</option>
          <option>Billing</option>
          <option>General Inquiry</option>
        </select>
      </div>
      <textarea
        id="message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Please describe your issue in detail..."
        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
        rows={5}
        required
      />
      <Button type="submit" isLoading={mutation.isLoading} className="w-auto">
        Submit Ticket
      </Button>
    </form>
  );
};

// --- Main Page Component ---
const AdminSupport = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['myTickets'],
    queryFn: fetchMyTickets,
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Support Tickets</h1>
        <Button onClick={() => setIsModalOpen(true)} className="w-auto">
          <Plus className="w-5 h-5 mr-1" /> Create New Ticket
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {isLoading && <li className="p-4 text-center">Loading tickets...</li>}
          {tickets?.length === 0 && (
            <li className="p-4 text-center text-gray-500">You have not submitted any tickets.</li>
          )}
          {tickets?.map(ticket => (
            <li key={ticket._id}>
              <Link to={`/support/ticket/${ticket._id}`} className="block hover:bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-primary truncate">{ticket.title}</p>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
                <div className="mt-2 flex justify-between">
                  <p className="text-sm text-gray-500">
                    Category: {ticket.category} | Last updated: {format(new Date(ticket.updatedAt), 'PP')}
                  </p>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Support Ticket">
        <NewTicketForm onSuccess={() => {}} onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default AdminSupport;