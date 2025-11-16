// frontend/src/pages/DevDashboard.jsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axios';
import { Link } from 'react-router-dom';
import { School, Users, DollarSign, ArrowRight } from 'lucide-react';

// Stat Card
const StatCard = ({ title, value, icon, to, color }) => (
  <Link
    to={to}
    className={`p-6 rounded-lg shadow text-white flex justify-between items-center transition-transform hover:scale-105 ${color}`}
  >
    <div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-lg">{title}</p>
    </div>
    {React.cloneElement(icon, { className: 'w-12 h-12 opacity-70' })}
  </Link>
);

// API Function
const fetchDevAnalytics = async () => {
  const { data } = await apiClient.get('/analytics/developer');
  return data;
};

const DevDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['devAnalytics'],
    queryFn: fetchDevAnalytics,
  });

  if (isLoading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Developer Overview
      </h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Schools"
          value={stats?.totalSchools || 0}
          icon={<School />}
          to="/schools"
          color="bg-blue-600"
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={<Users />}
          to="#"
          color="bg-green-600"
        />
        <StatCard
          title="Total Revenue (KES)"
          value={stats?.totalRevenue.toFixed(2) || '0.00'}
          icon={<DollarSign />}
          to="/plans"
          color="bg-purple-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/schools" className="flex items-center space-x-2 py-2 px-4 text-white bg-primary rounded-md shadow-sm hover:bg-blue-700">
            <span>Manage Schools</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/plans" className="flex items-center space-x-2 py-2 px-4 text-primary bg-white border border-primary rounded-md shadow-sm hover:bg-gray-50">
            <span>Manage Billing Plans</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DevDashboard;