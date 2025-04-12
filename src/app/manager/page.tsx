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
  FaMoneyBillWave,
  FaSpinner
} from 'react-icons/fa';
import Link from 'next/link';
import { ManagerStatCards } from '@/components/dashboard/StatCards';
import { useStats, ManagerStats } from '@/hooks/useStats';

export default function ManagerDashboard() {
  // Fetch dashboard stats
  const { stats, loading, error } = useStats();

  // Check if the stats are for manager role
  const isManagerStats = (stats: any): stats is ManagerStats => {
    return stats && 'tableStats' in stats;
  };

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

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-40">
          <FaSpinner className="animate-spin text-2xl text-gray-500" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Failed to load dashboard data. Please try again later.</p>
        </div>
      )}

      {/* Stats Cards */}
      {!loading && !error && stats && isManagerStats(stats) && (
        <ManagerStatCards stats={stats} />
      )}

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
      
      {/* Recent Activity and Orders Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent Orders */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          {!loading && !error && stats && isManagerStats(stats) ? (
            stats.pendingOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.pendingOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap">{order.orderNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{order.table?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">₹{order.total.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No pending orders</p>
            )
          ) : (
            <div className="h-40 flex items-center justify-center">
              <p className="text-gray-500">Loading orders...</p>
            </div>
          )}
        </div>

        {/* Recent Customers */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Customers</h2>
          {!loading && !error && stats && isManagerStats(stats) ? (
            stats.recentCustomers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visits</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.recentCustomers.map((customer) => (
                      <tr key={customer._id}>
                        <td className="px-6 py-4 whitespace-nowrap">{customer.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{customer.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{customer.visits}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(customer.lastVisit).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No recent customers</p>
            )
          ) : (
            <div className="h-40 flex items-center justify-center">
              <p className="text-gray-500">Loading customers...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 