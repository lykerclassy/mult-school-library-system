import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BookOpen, LogIn, LogOut, UserPlus } from 'lucide-react'; // npm install lucide-react

const Header = () => {
  const { userInfo, setUserInfo } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout');
      setUserInfo(null); // This triggers the localStorage removal in context
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            to={userInfo ? '/dashboard' : '/'}
            className="flex items-center gap-2 text-xl font-bold text-indigo-600"
          >
            <BookOpen size={28} />
            <span>School L-M-S</span>
          </Link>
          <div className="flex items-center gap-4">
            {userInfo ? (
              <>
                <span className="text-gray-700">
                  Hi,{' '}
                  <strong className="font-medium">{userInfo.username}</strong> (
                  {userInfo.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-600"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
                >
                  <LogIn size={16} />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register-dev"
                  className="flex items-center gap-2 rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-700"
                >
                  <UserPlus size={16} />
                  <span>Dev Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;