'use client';

import React from 'react';
import { login } from '../utils/auth';
import { FaUserTie, FaUsers, FaHome } from 'react-icons/fa';
import Link from 'next/link';

export default function LoginPage() {
  const handleLogin = (role: 'manager' | 'waiter' | 'chef' | 'guest') => {
    login(role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-indigo-600 p-6 text-center">
            <h1 className="text-2xl font-bold text-white">Restaurant Management</h1>
            <p className="text-indigo-200 mt-1">Select a role to continue</p>
          </div>
          
          <div className="p-6">
            <div className="mb-4">
              <p className="text-gray-600 mb-2">This is a demo application. Choose a role to log in:</p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => handleLogin('manager')}
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
              >
                <FaUserTie className="mr-3" />
                Login as Manager
              </button>
              
              <button
                onClick={() => handleLogin('waiter')}
                className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors"
              >
                <FaUsers className="mr-3" />
                Login as Waiter
              </button>

              <button
                onClick={() => handleLogin('chef')}
                className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors"
              >
                <FaUsers className="mr-3" />
                Login as Chef
              </button>
              
              <Link href="/" className="w-full flex items-center justify-center py-3 px-4 border border-gray-200 rounded-md text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium transition-colors">
                <FaHome className="mr-3" />
                Return to Home
              </Link>
            </div>
            
            <div className="mt-8 text-center text-xs text-gray-500">
              <p>In a real application, this would be a secure login form.</p>
              <p className="mt-1">The demo allows you to switch between roles to see different views.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 