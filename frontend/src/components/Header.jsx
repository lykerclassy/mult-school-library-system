import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BookOpen, LogIn, LogOut, UserPlus, Menu, X } from 'lucide-react';

const Header = () => {
  const { userInfo, setUserInfo } = useAuth(); // Using the context we built
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout');
      setUserInfo(null); // This clears context and localStorage
      toast.success('Logged out successfully');
      setIsMobileMenuOpen(false); // Close mobile menu on logout
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const NavLinks = ({ isMobile = false }) => (
    <div
      className={`flex items-center ${
        isMobile
          ? 'flex-col space-y-4 pt-4'
          : 'hidden space-x-4 md:flex'
      }`}
    >
      {userInfo ? (
        <>
          <span className="text-gray-700 md:text-white">
            Hi, <strong className="font-medium">{userInfo.username}</strong> (
            {userInfo.role})
          </span>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-600"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </>
      ) : (
        <>
          <Link
            to="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            <LogIn size={16} />
            <span>Login</span>
          </Link>
          {/* THIS IS THE LINK YOU WERE MISSING */}
          <Link
            to="/register-dev"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-700"
          >
            <UserPlus size={16} />
            <span>Dev Register</span>
          </Link>
        </>
      )}
    </div>
  );

  return (
    <header className="bg-gray-800 text-white shadow-md">
      <nav className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <Link
            to={userInfo ? '/dashboard' : '/'}
            className="flex items-center gap-2 text-xl font-bold"
          >
            <BookOpen size={28} />
            <span>School L-M-S</span>
          </Link>

          {/* Desktop Nav */}
          <NavLinks />

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="pb-4 md:hidden">
            <NavLinks isMobile={true} />
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;