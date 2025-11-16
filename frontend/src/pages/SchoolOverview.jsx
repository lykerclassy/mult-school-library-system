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

// --- (StatCard component is unchanged) ---
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
const fetchDashboardAnalytics = async () => (await apiClient.get('/analytics/dashboard')).data;
const fetchSchoolProfile = async () => (await apiClient.get('/schools/profile')).data; // <-- NEW FETCH

// --- Main Page Component ---
const SchoolOverview = () => {
  // 1. Fetch Analytics
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['dashboardAnalytics'],
    queryFn: fetchDashboardAnalytics,
  });
  
  // 2. Fetch School Profile (to get plan limits)
  const { data: school, isLoading: isLoadingSchool } = useQuery({
    queryKey: ['schoolProfile'],
    queryFn: fetchSchoolProfile,
  });

  const isLoading = isLoadingAnalytics || isLoadingSchool;
  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  const stats = analytics?.coreStats;
  const booksBySubject = analytics?.booksBySubject;
  const recentTransactions = analytics?.recentTransactions;
  
  // 3. Get Plan Limits
  const plan = school?.plan;
  const studentLimit = plan?.studentLimit || '∞';
  const teacherLimit = plan?.teacherLimit || '∞';

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        School Overview
      </h1>

      {/* Stats Cards (UPDATED) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={`${stats?.totalStudents || 0} / ${studentLimit}`}
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
        <StatCard
          title="Total Staff"
          value={`${stats?.totalStaff || 0} / ${teacherLimit}`}
          icon={<UserCheck />}
          color="bg-red-500"
        />
      </div>

      {/* (Charts and Recent Activity are unchanged) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          {/* ... (Pie Chart) ... */}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          {/* ... (Recent Transactions) ... */}
        </div>
      </div>
    </div>
  );
};

export default SchoolOverview;