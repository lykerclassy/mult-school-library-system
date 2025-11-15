// frontend/src/pages/TeacherDashboard.jsx

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Book, Edit, ClipboardList } from 'lucide-react';

const StatCard = ({ title, value, icon, to, color }) => (
  <Link
    to={to}
    className={`p-6 rounded-lg shadow text-white flex items-center space-x-4 transition-transform hover:scale-105 ${color}`}
  >
    {React.cloneElement(icon, { className: 'w-10 h-10' })}
    <div>
      <p className="text-3xl font-bold">{title}</p>
      <p className="text-lg">{value}</p>
    </div>
  </Link>
);

const TeacherDashboard = () => {
  const { userInfo } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Welcome, {userInfo?.name}!
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        This is your teaching dashboard.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="My Assignments"
          value="Create & Manage"
          icon={<Edit />}
          to="/teacher/assignments"
          color="bg-blue-500"
        />
        <StatCard
          title="Learning Resources"
          value="Upload & Share"
          icon={<ClipboardList />}
          to="/resources"
          color="bg-green-500"
        />
        <StatCard
          title="Quiz Builder"
          value="Create Quizzes"
          icon={<Book />}
          to="/quiz-builder"
          color="bg-purple-500"
        />
      </div>

      <div className="mt-10 bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Recent Submissions</h2>
        <p className="text-gray-400 mt-2">
          (This section will show a list of recent student submissions.)
        </p>
      </div>
    </div>
  );
};

export default TeacherDashboard;