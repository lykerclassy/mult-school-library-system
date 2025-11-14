// frontend/src/pages/StudentPortal.jsx

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Book, Sparkles, ClipboardList } from 'lucide-react';

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

const StudentPortal = () => {
  const { userInfo } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Welcome, {userInfo?.name}!
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        This is your personal dashboard.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="My Borrowed Books"
          value="View History"
          icon={<Book />}
          to="/my-books"
          color="bg-blue-500"
        />
        <StatCard
          title="AI Quiz Generator"
          value="Start a new quiz"
          icon={<Sparkles />}
          to="/quiz"
          color="bg-green-500"
        />
        <StatCard
          title="E-Books & Papers"
          value="Browse resources"
          icon={<ClipboardList />}
          to="/ebooks"
          color="bg-purple-500"
        />
      </div>

      <div className="mt-10 bg-surface p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Due Books</h2>
        <p className="text-gray-600">
          (This section will show a list of books you have borrowed that are
          due soon.)
        </p>
        <p className="text-gray-400 mt-2">No books due at the moment.</p>
      </div>
    </div>
  );
};

export default StudentPortal;