// frontend/src/pages/SupportTickets.jsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axios';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const fetchAllTickets = async () => (await apiClient.get('/comm/support-tickets')).data;

const getStatusColor = (status) => {
  if (status === 'Open') return 'bg-red-100 text-red-800';
  if (status === 'In Progress') return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
};

const SupportTickets = () => {
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['allTickets'],
    queryFn: fetchAllTickets,
  });

  if (isLoading) return <div>Loading tickets...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Support Tickets</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets?.map(ticket => (
                <tr key={ticket._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ticket.school.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.submittedBy.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/support/ticket/${ticket._id}`} className="text-primary hover:underline">
                      View
                    </Link>
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

export default SupportTickets;