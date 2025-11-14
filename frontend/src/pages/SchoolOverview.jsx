// frontend/src/pages/SchoolOverview.jsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axios';
import { Users, Book, Library, UserCheck } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// --- Components ---

// Reusable stat card
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-surface p-6 rounded-lg shadow flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color}`}>
      {React.cloneElement(icon, { className: 'w-6 h-6 text-white' })}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

// THIS IS THE HARDCODED DATA YOU MENTIONED.
// It's a placeholder until we build the book borrowing feature.
const chartData = [
  { name: 'Mon', borrowed: 20 },
  { name: 'Tue', borrowed: 30 },
  { name: 'Wed', borrowed: 15 },
  { name: 'Thu', borrowed: 45 },
  { name: 'Fri', borrowed: 35 },
];

// --- API Functions ---
const fetchStats = async () => {
  const { data } = await apiClient.get('/schools/stats');
  return data; // This data is REAL (from the database)
};

// --- Main Page Component ---
const SchoolOverview = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['schoolStats'],
    queryFn: fetchStats,
  });

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        School Overview
      </h1>

      {/* Stats Cards (These are REAL) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          title="Books Borrowed"
          value={stats?.borrowedBooks || 0} // This is 0 (real)
          icon={<Library />}
          color="bg-yellow-500"
        />
        <StatCard
          title="Total Staff"
          value={stats?.totalStaff || 0}
          icon={<UserCheck />}
          color="bg-red-500"
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Bar Chart (This is FAKE/Placeholder) */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Books Borrowed This Week</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
      <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="borrowed" fill="#1D4ED8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity (Placeholder) */}
        <div className="bg-surface p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <ul className="space-y-4">
            <li className="text-sm">
              <strong>John Doe</strong> borrowed "History of Time".
            </li>
            <li className="text-sm">
              <strong>Jane Smith</strong> returned "The Great Gatsby".
            </li>
            <li className="text-sm">New book "Chemistry 101" added.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SchoolOverview;