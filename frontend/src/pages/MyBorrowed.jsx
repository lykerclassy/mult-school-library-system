// frontend/src/pages/MyBorrowed.jsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axios';
import { format } from 'date-fns';
import { Book, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

// --- API Function ---
const fetchMyTransactions = async () => {
  const { data } = await apiClient.get('/transactions/my-history');
  return data;
};

// --- Helper Function ---
const getStatusIcon = (status, dueDate) => {
  const isOverdue = new Date(dueDate) < new Date() && status !== 'Returned';

  if (isOverdue) {
    return (
      <span className="flex items-center text-xs font-semibold text-red-800 bg-red-100 px-2 py-0.5 rounded-full">
        <AlertTriangle className="w-4 h-4 mr-1" />
        Overdue
      </span>
    );
  }

  if (status === 'Issued') {
    return (
      <span className="flex items-center text-xs font-semibold text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-full">
        <Clock className="w-4 h-4 mr-1" />
        Issued
      </span>
    );
  }

  if (status === 'Returned') {
    return (
      <span className="flex items-center text-xs font-semibold text-green-800 bg-green-100 px-2 py-0.5 rounded-full">
        <CheckCircle className="w-4 h-4 mr-1" />
        Returned
      </span>
    );
  }
};

// --- Main Page Component ---
const MyBorrowed = () => {
  const {
    data: transactions,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['myTransactions'],
    queryFn: fetchMyTransactions,
  });

  if (isLoading) return <div>Loading your book history...</div>;
  if (isError) return <div>Error loading your history.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        My Borrowed Books
      </h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Book Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date Issued
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date Due
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date Returned
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((tx) => (
                <tr key={tx._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {tx.book?.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      ISBN: {tx.book?.isbn || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tx.book?.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(tx.issueDate), 'PP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {format(new Date(tx.dueDate), 'PP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tx.returnDate
                      ? format(new Date(tx.returnDate), 'PP')
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusIcon(tx.status, tx.dueDate)}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    You have not borrowed any books.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyBorrowed;