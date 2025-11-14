// /frontend/src/components/layout/Sidebar.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Book,
  Users,
  School,
  Settings,
  BookOpen,
  ClipboardList,
  Sparkles,
  ArrowRightLeft, // Icon for transactions
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { userInfo } = useAuth();

  // Define links for all roles
  const navLinks = {
    Developer: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { name: 'Schools', icon: School, path: '/schools' },
    ],
    SchoolAdmin: [
      { name: 'Overview', icon: LayoutDashboard, path: '/' },
      { name: 'Transactions', icon: ArrowRightLeft, path: '/transactions' }, // <-- Added for Admin too
      { name: 'Books', icon: Book, path: '/books' },
      { name: 'Students', icon: Users, path: '/students' },
      { name: 'Staff', icon: Users, path: '/staff' },
      { name: 'Settings', icon: Settings, path: '/settings' },
    ],
    Librarian: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { name: 'Books', icon: Book, path: '/books' },
      { name: 'Students', icon: Users, path: '/students' },
      { name: 'Settings', icon: Settings, path: '/settings' },
    ],
    Student: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { name: 'My Borrowed', icon: BookOpen, path: '/my-books' },
      { name: 'E-Books', icon: ClipboardList, path: '/ebooks' },
      { name: 'AI Quiz', icon: Sparkles, path: '/quiz' },
      { name: 'Quiz History', icon: ClipboardList, path: '/quiz-history' },
      { name: 'Settings', icon: Settings, path: '/settings' },
    ],
  };

  const links = navLinks[userInfo?.role] || [];

  return (
    <aside className="w-64 h-screen bg-gray-800 text-white flex flex-col">
      <div className="h-16 flex items-center justify-center text-2xl font-bold border-b border-gray-700">
        LMS Portal
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 p-2 rounded-md transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <link.icon className="w-5 h-5" />
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        {/* We can add a footer or user info here later */}
      </div>
    </aside>
  );
};

export default Sidebar;