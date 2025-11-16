// /frontend/src/components/layout/Sidebar.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Book, Users, School, Settings, BookOpen,
  ClipboardList, Sparkles, ArrowRightLeft, ChevronsLeft, ChevronsRight,
  Folder, FileText, Edit, Trophy, Briefcase, Heart, UserCheck, CreditCard,
  Megaphone, LifeBuoy, SlidersHorizontal, Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import useSidebarStore from '../../hooks/useSidebar';
import { twMerge } from 'tailwind-merge';

const NavItem = ({ link }) => {
  const { isOpen } = useSidebarStore();
  return (
    <NavLink
      to={link.path}
      className={({ isActive }) =>
        twMerge(
          'flex items-center space-x-3 p-2 rounded-md transition-colors text-gray-300 hover:bg-gray-700 hover:text-white',
          isActive && 'bg-primary text-white',
          !isOpen && 'justify-center'
        )
      }
    >
      <link.icon className="w-5 h-5 flex-shrink-0" />
      <span
        className={twMerge(
          'transition-all duration-200',
          !isOpen && 'w-0 opacity-0'
        )}
      >
        {link.name}
      </span>
    </NavLink>
  );
};

const Sidebar = () => {
  const { userInfo } = useAuth();
  const { isOpen, setIsOpen } = useSidebarStore();

  const navLinks = {
    Developer: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { name: 'Schools', icon: School, path: '/schools' },
      { name: 'Billing & Plans', icon: CreditCard, path: '/plans' },
      { name: 'Announcements', icon: Megaphone, path: '/dev/announcements' },
      { name: 'Support Tickets', icon: LifeBuoy, path: '/dev/support' },
      { name: 'System Settings', icon: SlidersHorizontal, path: '/dev/settings' },
    ],
    SchoolAdmin: [
      { name: 'Overview', icon: LayoutDashboard, path: '/' },
      { name: 'Announcements', icon: Megaphone, path: '/announcements' },
      { name: 'Timetables', icon: Calendar, path: '/admin/timetables' },
      { name: 'Transactions', icon: ArrowRightLeft, path: '/transactions' },
      { name: 'Books', icon: Book, path: '/books' },
      { name: 'Resources', icon: FileText, path: '/resources' },
      { name: 'Categories', icon: Folder, path: '/categories' },
      { name: 'Quiz Builder', icon: Edit, path: '/quiz-builder' },
      { name: 'Students', icon: Users, path: '/students' },
      { name: 'Parents', icon: UserCheck, path: '/parents' },
      { name: 'Staff', icon: Users, path: '/staff' },
      { name: 'Support', icon: LifeBuoy, path: '/support' },
      { name: 'Settings', icon: Settings, path: '/settings' },
    ],
    Librarian: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { name: 'Announcements', icon: Megaphone, path: '/announcements' },
      { name: 'Books', icon: Book, path: '/books' },
      { name: 'Resources', icon: FileText, path: '/resources' },
      { name: 'Quiz Builder', icon: Edit, path: '/quiz-builder' },
      { name: 'Students', icon: Users, path: '/students' },
      { name: 'Settings', icon: Settings, path: '/settings' },
    ],
    Teacher: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { name: 'Announcements', icon: Megaphone, path: '/announcements' },
      { name: 'Timetable', icon: Calendar, path: '/my-timetable' },
      { name: 'Assignments', icon: Briefcase, path: '/teacher/assignments' },
      { name: 'Resources', icon: FileText, path: '/resources' },
      { name: 'Quiz Builder', icon: Edit, path: '/quiz-builder' },
      { name: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
      { name: 'Settings', icon: Settings, path: '/settings' },
    ],
    Student: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { name: 'Announcements', icon: Megaphone, path: '/announcements' },
      { name: 'Timetable', icon: Calendar, path: '/my-timetable' },
      { name: 'My Borrowed', icon: BookOpen, path: '/my-books' },
      { name: 'Resources', icon: FileText, path: '/resources' },
      { name: 'Assignments', icon: Briefcase, path: '/student/assignments' },
      { name: 'Manual Quiz', icon: Edit, path: '/manual-quiz' },
      // --- THIS IS THE FIX ---
      { name: 'AI Quiz', icon: Sparkles, path: '/ai-quiz' },
      // --- END OF FIX ---
      { name: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
      { name: 'Quiz History', icon: ClipboardList, path: '/quiz-history' },
      { name: 'Settings', icon: Settings, path: '/settings' },
    ],
    Parent: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { name: 'Announcements', icon: Megaphone, path: '/announcements' },
      { name: 'My Children', icon: Heart, path: '/parent/children' },
      { name: 'Settings', icon: Settings, path: '/settings' },
    ],
  };

  const links = navLinks[userInfo?.role] || [];
  return (
    <aside
      className={twMerge(
        'h-screen bg-gray-800 text-white flex flex-col transition-all duration-300 z-40 fixed md:relative',
        isOpen ? 'w-64' : 'w-20',
        !isOpen && 'md:w-20',
        !isOpen && '-translate-x-full md:translate-x-0'
      )}
    >
      <div
        className={twMerge(
          'h-16 flex items-center justify-between border-b border-gray-700 px-4',
          !isOpen && 'px-0 justify-center'
        )}
      >
        <span
          className={twMerge(
            'text-2xl font-bold transition-all',
            !isOpen && 'w-0 opacity-0'
          )}
        >
          LMS Portal
        </span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md hover:bg-gray-700 md:hidden"
        >
          <ChevronsLeft className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {links.map((link) => (
          <NavItem key={link.name} link={link} />
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className={twMerge('text-xs text-gray-400', !isOpen && 'hidden')}>
          <p>&copy; {new Date().getFullYear()} LMS</p>
          <p>All rights reserved.</p>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hidden md:flex items-center justify-center w-full p-2 mt-2 rounded-md hover:bg-gray-700"
        >
          {isOpen ? (
            <ChevronsLeft className="w-6 h-6" />
          ) : (
            <ChevronsRight className="w-6 h-6" />
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;