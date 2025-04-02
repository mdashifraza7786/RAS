'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FaUtensils, 
  FaClipboardList, 
  FaReceipt, 
  FaUsers, 
  FaBell,
  FaClock,
  FaShoppingCart,
  FaCheck
} from 'react-icons/fa';

export default function WaiterDashboard() {
  // Sample data
  const quickStats = [
    { 
      title: 'Active Tables', 
      value: '8/12', 
      icon: <FaUtensils className="h-6 w-6 text-indigo-500" />,
      link: '/waiter/tables',
      description: '8 occupied, 4 available'
    },
    { 
      title: 'Open Orders', 
      value: '5', 
      icon: <FaClipboardList className="h-6 w-6 text-amber-500" />,
      link: '/waiter/orders',
      description: '2 pending, 3 in preparation'
    },
    { 
      title: 'Ready to Serve', 
      value: '3', 
      icon: <FaBell className="h-6 w-6 text-green-500" />,
      link: '/waiter/orders',
      description: 'Orders ready for service'
    },
    { 
      title: 'Unpaid Bills', 
      value: '2', 
      icon: <FaReceipt className="h-6 w-6 text-red-500" />,
      link: '/waiter/bills',
      description: 'Awaiting payment'
    },
  ];

  const recentActivity = [
    { 
      id: 1, 
      action: 'Order #1042 is ready to serve', 
      time: '2 minutes ago',
      icon: <FaBell className="h-4 w-4 text-green-500" />
    },
    { 
      id: 2, 
      action: 'Table 3 requested the bill', 
      time: '5 minutes ago',
      icon: <FaReceipt className="h-4 w-4 text-amber-500" />
    },
    { 
      id: 3, 
      action: 'New reservation arrived for Table 7', 
      time: '12 minutes ago',
      icon: <FaUsers className="h-4 w-4 text-indigo-500" />
    },
    { 
      id: 4, 
      action: 'Kitchen updated status for Order #1039', 
      time: '18 minutes ago',
      icon: <FaClock className="h-4 w-4 text-gray-500" />
    },
    { 
      id: 5, 
      action: 'Payment processed for Table 5 - ₹1,250.00', 
      time: '25 minutes ago',
      icon: <FaCheck className="h-4 w-4 text-green-500" />
    },
  ];

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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Waiter Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, index) => (
          <Link 
            href={stat.link} 
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
                  {stat.icon}
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
        <div className="divide-y divide-gray-200">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="px-6 py-4 flex items-start">
              <div className="mr-4 mt-1">
                {activity.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 px-6 py-3">
          <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            View all activity
          </button>
        </div>
      </div>
    </div>
  );
} 