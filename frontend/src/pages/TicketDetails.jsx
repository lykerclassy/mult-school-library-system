// frontend/src/pages/TicketDetails.jsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Send, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

// --- API Functions ---
const fetchTicket = async (id) => (await apiClient.get(`/comm/support-tickets/${id}`)).data; // We need a new backend route for this
const replyToTicket = async ({ id, message }) => (await apiClient.post(`/comm/support-tickets/${id}/reply`, { message })).data;

// --- Main Page Component ---
const TicketDetails = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { userInfo } = useAuth();
  const [message, setMessage] = useState('');

  // This will fail (404) until we add the backend route
  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => fetchTicket(id),
  });

  const mutation = useMutation({
    mutationFn: replyToTicket,
    onSuccess: () => {
      queryClient.invalidateQueries(['ticket', id]);
      setMessage('');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ id, message });
  };

  if (isLoading) return <div>Loading ticket...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{ticket?.title}</h1>
      <p className="text-gray-500 mb-6">Ticket #{ticket?._id.slice(-6)}</p>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Conversation</h2>
        </div>
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {ticket?.messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === userInfo._id ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-4 rounded-lg max-w-lg ${
                msg.sender === userInfo._id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs opacity-70 mt-1 text-right">{format(new Date(msg.timestamp), 'p')}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Reply Form */}
        <div className="p-4 border-t bg-gray-50">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your reply..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              disabled={ticket?.status === 'Closed'}
            />
            <Button type="submit" isLoading={mutation.isLoading} className="w-auto" disabled={ticket?.status === 'Closed'}>
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;