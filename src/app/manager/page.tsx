'use client';

import React from 'react';
import { 
  FaUsers, 
  FaCalendarAlt, 
  FaChartBar, 
  FaCreditCard, 
  FaClipboardList, 
  FaUtensils,
  FaArrowRight,
  FaUserClock,
  FaMoneyBillWave
} from 'react-icons/fa';
import Link from 'next/link';

export default function ManagerDashboard() {
  // Quick statistics for the dashboard
  const quickStats = [
    { label: 'Total Staff', value: '24', icon: <FaUsers className="text-indigo-500" />, link: '/manager/staff' },
    { label: 'Present Today', value: '18', icon: <FaUserClock className="text-green-500" />, link: '/manager/staff' },
    { label: "Today's Revenue", value: '₹42,800', icon: <FaMoneyBillWave className="text-blue-500" />, link: '/manager/payments' },
    { label: 'Pending Orders', value: '8', icon: <FaUtensils className="text-orange-500" />, link: '/manager/inventory' },
  ];

  // Management card links
  const managerLinks = [
    {
      title: 'Staff Management',
      description: 'Manage staff details, track attendance, and performance.',
      icon: <FaUsers className="text-white text-2xl" />,
      bgColor: 'bg-indigo-600',
      link: '/manager/staff'
    },
    {
      title: 'Schedule Management',
      description: 'Create and manage staff schedules and shifts.',
      icon: <FaCalendarAlt className="text-white text-2xl" />,
      bgColor: 'bg-green-600',
      link: '/manager/schedule'
    },
    {
      title: 'Reports & Analytics',
      description: 'View detailed reports and business analytics.',
      icon: <FaChartBar className="text-white text-2xl" />,
      bgColor: 'bg-blue-600',
      link: '/manager/reports'
    },
    {
      title: 'Payment Management',
      description: 'Track payments, invoices, and financial transactions.',
      icon: <FaCreditCard className="text-white text-2xl" />,
      bgColor: 'bg-purple-600',
      link: '/manager/payments'
    },
    {
      title: 'Inventory Control',
      description: 'Manage and track inventory levels and orders.',
      icon: <FaClipboardList className="text-white text-2xl" />,
      bgColor: 'bg-orange-600',
      link: '/manager/inventory'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Welcome, Manager</h1>
        <p className="text-gray-600">Here&apos;s an overview of your restaurant</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <div className="p-3 rounded-full bg-gray-50">{stat.icon}</div>
              <Link href={stat.link} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">View →</Link>
            </div>
            <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Manager Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {managerLinks.map((card, index) => (
          <Link key={index} href={card.link} className="block">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
              <div className={`${card.bgColor} p-4 flex items-center justify-center`}>
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  {card.icon}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{card.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{card.description}</p>
                <div className="flex items-center text-indigo-600 font-medium text-sm">
                  Access <FaArrowRight className="ml-2" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activities</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-start">
              <div className="rounded-full bg-green-100 p-2 mr-4">
                <FaUsers className="text-green-600" />
              </div>
              <div>
                <p className="text-gray-800 font-medium">Staff attendance updated</p>
                <p className="text-gray-500 text-sm">18 staff members marked present today</p>
                <p className="text-gray-400 text-xs mt-1">Today, 9:30 AM</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-start">
              <div className="rounded-full bg-blue-100 p-2 mr-4">
                <FaMoneyBillWave className="text-blue-600" />
              </div>
              <div>
                <p className="text-gray-800 font-medium">New payment received</p>
                <p className="text-gray-500 text-sm">Order #3842 - ₹1,240</p>
                <p className="text-gray-400 text-xs mt-1">Today, 8:45 AM</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-start">
              <div className="rounded-full bg-orange-100 p-2 mr-4">
                <FaClipboardList className="text-orange-600" />
              </div>
              <div>
                <p className="text-gray-800 font-medium">Inventory updated</p>
                <p className="text-gray-500 text-sm">6 items restocked</p>
                <p className="text-gray-400 text-xs mt-1">Yesterday, 5:30 PM</p>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex items-start">
              <div className="rounded-full bg-indigo-100 p-2 mr-4">
                <FaCalendarAlt className="text-indigo-600" />
              </div>
              <div>
                <p className="text-gray-800 font-medium">Schedule updated</p>
                <p className="text-gray-500 text-sm">Staff schedule for next week published</p>
                <p className="text-gray-400 text-xs mt-1">Yesterday, 2:15 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 