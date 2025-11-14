// /frontend/src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import LoginModal from '../features/auth/LoginModal'; // <-- IMPORT NEW MODAL

// --- Main Page Component ---
const LoginPage = () => {
  const [modalType, setModalType] = useState(null); // 'Student', 'SchoolAdmin', 'Developer'

  const openModal = (type) => setModalType(type);
  const closeModal = () => setModalType(null);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">
          Library Management System
        </h2>
        <p className="text-center text-gray-600">
          Please select your role to sign in
        </p>

        {/* --- Call to Action Buttons --- */}
        <div className="space-y-4 pt-4">
          <Button onClick={() => openModal('Student')}>
            Login as Student
          </Button>
          <Button onClick={() => openModal('SchoolAdmin')}>
            Login as School Admin
          </Button>
          <Button onClick={() => openModal('Developer')}>
            Login as Developer
          </Button>
        </div>

        <p className="text-sm text-center text-gray-600">
          First time Developer?{' '}
          <Link
            to="/register-developer"
            className="font-medium text-primary hover:underline"
          >
            Create Account
          </Link>
        </p>
      </div>

      {/* --- The Modal --- */}
      <LoginModal
        modalType={modalType}
        isOpen={!!modalType}
        onClose={closeModal}
      />
    </div>
  );
};

export default LoginPage;