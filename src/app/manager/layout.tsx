'use client';

import React, { useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { 
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import { useManagerAuth, logout } from '../utils/auth';

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Use the manager authentication hook
  const { isLoading, isManager } = useManagerAuth('/login');

  const logoutHandler = () => {
    logout();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated/authorized as manager
  if (!isManager) {
    return null;
  }

  return (
    <div className="h-screen flex">
      {/* Sidebar - Fixed width - Only visible on desktop */}
      <aside className="hidden md:block w-64 h-screen flex-shrink-0">
        <DashboardSidebar />
      </aside>
      
      {/* Mobile sidebar */}
      <div className={`
        fixed inset-y-0 left-0 transform
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:hidden transition duration-200 ease-in-out z-30
        w-64
      `}>
        <DashboardSidebar />
        
        {/* Logout button for mobile */}
        <div className="absolute bottom-0 left-0 w-full px-5 py-4 border-t border-gray-200 bg-white">
          <button 
            onClick={logoutHandler}
            className="flex w-full items-center px-4 py-3 text-sm font-medium rounded-md text-gray-700 hover:bg-indigo-50 transition-colors"
          >
            <FaSignOutAlt className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
      
      {/* Main Content Container */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Menu Button */}
        <div className="md:hidden bg-indigo-600 text-white p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Manager Dashboard</h1>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 focus:outline-none"
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Header */}
        <header className="bg-white border-b border-gray-200 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-xl font-semibold text-gray-800">
              Manager Dashboard
            </h1>
            <div className="flex items-center">
              <div className="mr-4 text-right">
                <p className="text-sm font-medium text-gray-900">Manager Account</p>
                <p className="text-xs text-gray-500">admin@restaurant.com</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                M
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content - Only this should scroll */}
        <main className="flex-1 overflow-auto p-6 pb-14">
          {children}
        </main>
      </div>
      
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
} 