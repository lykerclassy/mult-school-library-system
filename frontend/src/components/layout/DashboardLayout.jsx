// /frontend/src/components/layout/DashboardLayout.jsx

import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import useSidebarStore from '../../hooks/useSidebar';
import { useAuth } from '../../context/AuthContext'; // <-- 1. IMPORT
import DemoRoleSwitcher from './DemoRoleSwitcher'; // <-- 2. IMPORT

const DashboardLayout = () => {
  const { isOpen, setIsOpen } = useSidebarStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // --- 3. GET USER INFO ---
  const { userInfo } = useAuth();
  const isDemoMode = userInfo?.email === 'demo@springfield.com';

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [setIsOpen]);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      {isOpen && isMobile && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* --- 4. ADD THE DEMO BAR (conditionally) --- */}
        {isDemoMode && <DemoRoleSwitcher />}
        
        <Header />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;