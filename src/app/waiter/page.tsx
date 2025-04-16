'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FaUtensils, 
  FaClipboardList, 
  FaReceipt, 
  FaBell,
  FaClock,
  FaShoppingCart,
  FaCheck,
  FaExclamationCircle,
  FaSpinner,
  FaTable,
  FaGlobe
} from 'react-icons/fa';
import { useWaiterDashboard } from '@/hooks/useWaiterDashboard';

export default function WaiterDashboard() {
  const { dashboardData, loading, error, lastUpdated, refreshData } = useWaiterDashboard();

  // Quick actions don't depend on API data
  const quickActions = [
    { 
      title: 'Take Order', 
      icon: <FaClipboardList className="h-5 w-5" />,
      link: '/waiter/orders/new',
      color: 'bg-indigo-600 hover:bg-indigo-700'
    },
    { 
      title: 'Process Payment', 
      icon: <FaReceipt className="h-5 w-5" />,
      link: '/waiter/bills/new',
      color: 'bg-green-600 hover:bg-green-700'
    },
    { 
      title: 'Table Status', 
      icon: <FaUtensils className="h-5 w-5" />,
      link: '/waiter/tables',
      color: 'bg-amber-600 hover:bg-amber-700'
    },
    { 
      title: 'View Orders', 
      icon: <FaShoppingCart className="h-5 w-5" />,
      link: '/waiter/orders',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
  ];

  // Helper function to get the icon for an activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order_ready':
      case 'order':
        return <FaBell className="h-4 w-4 text-green-500" />;
      case 'bill_request':
      case 'payment':
        return <FaReceipt className="h-4 w-4 text-amber-500" />;
      case 'reservation':
      case 'table':
        return <FaTable className="h-4 w-4 text-indigo-500" />;
      case 'order_update':
        return <FaClock className="h-4 w-4 text-gray-500" />;
      default:
        return <FaBell className="h-4 w-4 text-blue-500" />;
    }
  };

  // Helper function to get the icon for a quick stat
  const getStatIcon = (title: string) => {
    switch (title) {
      case 'My Tables':
        return <FaTable className="h-6 w-6 text-indigo-500" />;
      case 'All Tables':
        return <FaGlobe className="h-6 w-6 text-blue-500" />;
      case 'Open Orders':
        return <FaClipboardList className="h-6 w-6 text-amber-500" />;
      case 'Ready to Serve':
        return <FaBell className="h-6 w-6 text-green-500" />;
      case 'Unpaid Bills':
        return <FaReceipt className="h-6 w-6 text-red-500" />;
      default:
        return <FaUtensils className="h-6 w-6 text-gray-500" />;
    }
  };

  // Function to get the link for a quick stat
  const getStatLink = (title: string) => {
    switch (title) {
      case 'My Tables':
      case 'All Tables':
        return '/waiter/tables';
      case 'Open Orders':
      case 'Ready to Serve':
        return '/waiter/orders';
      case 'Unpaid Bills':
        return '/waiter/bills';
      default:
        return '/waiter';
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[70vh]">
        <FaSpinner className="h-8 w-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[70vh] text-center">
        <FaExclamationCircle className="h-10 w-10 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to load dashboard</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button 
          onClick={() => refreshData()} 
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Get quick stats array from dashboardData
  const quickStats = dashboardData ? [
    dashboardData.quickStats.activeTables,
    dashboardData.quickStats.allTables,
    dashboardData.quickStats.openOrders,
    dashboardData.quickStats.readyToServe,
    dashboardData.quickStats.unpaidBills,
  ] : [];

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Waiter Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        {lastUpdated && (
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
            <button 
              onClick={() => refreshData()} 
              className="ml-2 text-indigo-600 hover:text-indigo-800"
              title="Refresh data"
            >
              ↻
            </button>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {quickStats.map((stat, index) => (
          <Link 
            href={getStatLink(stat.title)} 
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  {getStatIcon(stat.title)}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              href={action.link}
              key={index}
              className={`${action.color} text-white rounded-lg shadow-md flex flex-col items-center justify-center py-6 px-4 hover:shadow-lg transition-shadow`}
            >
              <div className="bg-white bg-opacity-20 p-3 rounded-full mb-3">
                {action.icon}
              </div>
              <span className="font-medium text-center">{action.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
        </div>
        {dashboardData && dashboardData.recentActivity.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {dashboardData.recentActivity.map((activity) => (
              <div key={activity.id} className="px-6 py-4 flex items-start">
                <div className="mr-4 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.timeSince}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">No recent activity</p>
          </div>
        )}
        {dashboardData && dashboardData.recentActivity.length > 0 && (
          <div className="bg-gray-50 px-6 py-3">
            <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              View all activity
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 