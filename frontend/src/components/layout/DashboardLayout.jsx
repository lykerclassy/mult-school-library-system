// /frontend/src/components/layout/DashboardLayout.jsx

import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import useSidebarStore from '../../hooks/useSidebar';

const DashboardLayout = () => {
  const { isOpen, setIsOpen } = useSidebarStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Effect to handle resizing and initial sidebar state
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsOpen(!mobile); // Close sidebar by default on mobile
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call on initial load

    return () => window.removeEventListener('resize', handleResize);
  }, [setIsOpen]);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile Backdrop - shown when sidebar is open on mobile */}
      {isOpen && isMobile && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
          <Outlet /> {/* This renders the active page component */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;