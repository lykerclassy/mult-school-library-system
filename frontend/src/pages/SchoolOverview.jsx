// frontend/src/pages/SchoolOverview.jsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axios';
import { Users, Book, Library, UserCheck } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

// --- Components ---

// Reusable stat card
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color}`}>
      {React.cloneElement(icon, { className: 'w-6 h-6 text-white' })}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

// Colors for the pie chart
const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// --- API Functions ---
const fetchDashboardAnalytics = async () => {
  const { data } = await apiClient.get('/analytics/dashboard');
  return data;
};

// --- Main Page Component ---
const SchoolOverview = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['dashboardAnalytics'],
    queryFn: fetchDashboardAnalytics,
  });

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  const stats = analytics?.coreStats;
  const booksBySubject = analytics?.booksBySubject;
  const recentTransactions = analytics?.recentTransactions;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        School Overview
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon={<Users />}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Books"
          value={stats?.totalBooks || 0}
          icon={<Book />}
          color="bg-green-500"
        />
        <StatCard
          title="Books Issued"
          value={stats?.totalIssued || 0}
          icon={<Library />}
          color="bg-yellow-500"
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Pie Chart (Books by Subject) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Books by Subject</h2>
          {booksBySubject?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={booksBySubject}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                >
                  {booksBySubject.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-gray-500">No subject data to display. Categorize your books to see this chart.</p>
            </div>
          )}
        </div>

        {/* Recent Activity (Real Data) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <ul className="space-y-4">
            {recentTransactions?.map(tx => (
              <li key={tx._id} className="text-sm border-b pb-2">
                <strong>{tx.student?.name}</strong> {tx.status === 'Issued' ? 'borrowed' : 'returned'} "{tx.book?.title}".
                <span className="block text-xs text-gray-500">{format(new Date(tx.createdAt), 'Pp')}</span>
              </li>
            ))}
            {recentTransactions?.length === 0 && (
              <p className="text-gray-500">No recent transactions.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SchoolOverview;