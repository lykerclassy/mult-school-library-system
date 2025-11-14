// frontend/src/pages/LibrarianDashboard.jsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { format } from 'date-fns';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

// --- Components ---

const IssueBookForm = () => {
  const queryClient = useQueryClient();
  const [studentAdm, setStudentAdm] = useState('');
  const [bookISBN, setBookISBN] = useState('');
  const [days, setDays] = useState(7);

  const mutation = useMutation({
    mutationFn: (data) => apiClient.post('/transactions/issue', data),
    onSuccess: () => {
      toast.success('Book issued successfully!');
      queryClient.invalidateQueries(['transactions']);
      // Clear form
      setStudentAdm('');
      setBookISBN('');
      setDays(7);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to issue book');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      studentAdmissionNumber: studentAdm,
      bookISBN: bookISBN,
      daysToReturn: days,
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Issue Book</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-1">
          <Input
            label="Student Admission No."
            id="studentAdm"
            value={studentAdm}
            onChange={(e) => setStudentAdm(e.target.value)}
            placeholder="e.g., 1001"
            required
          />
        </div>
        <div className="md:col-span-1">
          <Input
            label="Book ISBN"
            id="bookISBN"
            value={bookISBN}
            onChange={(e) => setBookISBN(e.target.value)}
            placeholder="Enter exact ISBN"
            required
          />
        </div>
        <div className="md:col-span-1">
          <Input
            label="Duration (Days)"
            id="days"
            type="number"
            min="1"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            required
          />
        </div>
        <div className="md:col-span-1">
          <Button type="submit" isLoading={mutation.isLoading}>
            Issue Book
          </Button>
        </div>
      </form>
    </div>
  );
};

const TransactionTable = () => {
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data } = await apiClient.get('/transactions');
      return data;
    },
  });

  const returnMutation = useMutation({
    mutationFn: (id) => apiClient.post(`/transactions/${id}/return`),
    onSuccess: () => {
      toast.success('Book returned!');
      queryClient.invalidateQueries(['transactions']);
    },
    onError: (error) => {
      toast.error('Failed to return book');
    },
  });

  if (isLoading) return <div>Loading records...</div>;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Transaction History</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issued Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions?.map((tx) => (
              <tr key={tx._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{tx.student?.name}</div>
                  <div className="text-sm text-gray-500">{tx.student?.admissionNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tx.book?.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(tx.issueDate), 'PP')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(tx.dueDate), 'PP')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      tx.status === 'Issued'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {tx.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {tx.status === 'Issued' && (
                    <button
                      onClick={() => returnMutation.mutate(tx._id)}
                      disabled={returnMutation.isLoading}
                      className="text-primary hover:text-blue-900 font-semibold"
                    >
                      Return Book
                    </button>
                  )}
                  {tx.status === 'Returned' && (
                    <span className="text-gray-400 flex items-center justify-end">
                      <CheckCircle className="w-4 h-4 mr-1" /> Done
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {transactions?.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const LibrarianDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Librarian Dashboard</h1>
      <IssueBookForm />
      <TransactionTable />
    </div>
  );
};

export default LibrarianDashboard;