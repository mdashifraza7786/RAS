'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FaClipboardList, 
  FaHamburger, 
  FaExclamationTriangle,
  FaClipboardCheck,
  FaFireAlt,
  FaRegClock,
  FaCheckCircle,
} from 'react-icons/fa';

export default function ChefDashboard() {
  // Sample data
  const quickStats = [
    { 
      title: 'Pending Orders', 
      value: '5', 
      icon: <FaClipboardList className="h-6 w-6 text-amber-500" />,
      link: '/chef/orders',
      description: 'Orders waiting to be prepared'
    },
    { 
      title: 'In Progress', 
      value: '3', 
      icon: <FaFireAlt className="h-6 w-6 text-orange-500" />,
      link: '/chef/orders/active',
      description: 'Currently being prepared'
    },
    { 
      title: 'Ready to Serve', 
      value: '2', 
      icon: <FaCheckCircle className="h-6 w-6 text-green-500" />,
      link: '/chef/orders/ready',
      description: 'Complete and ready for pickup'
    },
    { 
      title: 'Low Inventory', 
      value: '3', 
      icon: <FaExclamationTriangle className="h-6 w-6 text-red-500" />,
      link: '/chef/inventory',
      description: 'Items running low'
    },
  ];

  const pendingOrders = [
    {
      id: 1042,
      table: 'Table 7',
      items: [
        { name: 'Butter Chicken', quantity: 1, special: 'Extra spicy' },
        { name: 'Garlic Naan', quantity: 2, special: '' },
        { name: 'Veg Biryani', quantity: 1, special: 'No onions' }
      ],
      timeReceived: '11:45 AM',
      priority: 'high'
    },
    {
      id: 1041,
      table: 'Table 3',
      items: [
        { name: 'Masala Dosa', quantity: 2, special: '' },
        { name: 'Sambar', quantity: 2, special: '' }
      ],
      timeReceived: '11:40 AM',
      priority: 'normal'
    },
    {
      id: 1040,
      table: 'Table 12',
      items: [
        { name: 'Paneer Tikka', quantity: 1, special: '' },
        { name: 'Tandoori Roti', quantity: 3, special: '' },
        { name: 'Dal Makhani', quantity: 1, special: 'Less cream' },
        { name: 'Jeera Rice', quantity: 2, special: '' }
      ],
      timeReceived: '11:35 AM',
      priority: 'normal'
    },
    {
      id: 1039,
      table: 'Takeaway',
      items: [
        { name: 'Chicken Biryani', quantity: 2, special: '' },
        { name: 'Raita', quantity: 1, special: '' }
      ],
      timeReceived: '11:30 AM',
      priority: 'high'
    },
    {
      id: 1038,
      table: 'Table 5',
      items: [
        { name: 'Malai Kofta', quantity: 1, special: '' },
        { name: 'Butter Naan', quantity: 2, special: '' }
      ],
      timeReceived: '11:25 AM',
      priority: 'normal'
    }
  ];

  const recentActivity = [
    { 
      id: 1, 
      action: 'Order #1037 marked as ready', 
      time: '5 minutes ago',
      icon: <FaCheckCircle className="h-4 w-4 text-green-500" />
    },
    { 
      id: 2, 
      action: 'Inventory alert: Low on Chicken', 
      time: '20 minutes ago',
      icon: <FaExclamationTriangle className="h-4 w-4 text-amber-500" />
    },
    { 
      id: 3, 
      action: 'Order #1036 started preparation', 
      time: '25 minutes ago',
      icon: <FaFireAlt className="h-4 w-4 text-orange-500" />
    },
    { 
      id: 4, 
      action: 'Added new recipe: Mango Lassi', 
      time: '1 hour ago',
      icon: <FaHamburger className="h-4 w-4 text-indigo-500" />
    },
    { 
      id: 5, 
      action: 'Order #1035 completed in 12 minutes', 
      time: '1 hour ago',
      icon: <FaRegClock className="h-4 w-4 text-gray-500" />
    },
  ];

  const quickActions = [
    { 
      title: 'Start Cooking', 
      icon: <FaFireAlt className="h-5 w-5" />,
      link: '/chef/orders/start',
      color: 'bg-amber-600 hover:bg-amber-700'
    },
    { 
      title: 'Mark Ready', 
      icon: <FaClipboardCheck className="h-5 w-5" />,
      link: '/chef/orders/complete',
      color: 'bg-green-600 hover:bg-green-700'
    },
   
    
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Chef Dashboard</h1>
        <p className="text-gray-600">Welcome to the kitchen. Here&apos;s your order queue and status.</p>
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

      {/* Orders grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Pending Orders */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Pending Orders</h2>
            <Link href="/chef/orders" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingOrders.map((order) => (
              <div key={order.id} className="px-6 py-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <span className={`h-2.5 w-2.5 rounded-full mr-2 ${
                      order.priority === 'high' ? 'bg-red-500' : 'bg-amber-500'
                    }`}></span>
                    <h3 className="text-lg font-semibold text-gray-800">Order #{order.id}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{order.timeReceived}</span>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                      {order.table}
                    </span>
                  </div>
                </div>
                <div className="space-y-1 mb-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <div className="text-sm">
                        <span className="font-medium">{item.quantity}× {item.name}</span>
                        {item.special && (
                          <span className="text-xs text-red-600 ml-2">({item.special})</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <button className="bg-amber-500 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-amber-600">
                    Start Cooking
                  </button>
                  <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-300">
                    Details
                  </button>
                </div>
              </div>
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
      
      {/* Inventory Alert */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <div className="flex items-center">
          <FaExclamationTriangle className="text-red-500 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-red-800">Low Inventory Alert</h3>
            <p className="text-sm text-red-700">
              The following items are running low: <span className="font-medium">Chicken (2kg), Paneer (1kg), Basmati Rice (3kg)</span>
            </p>
          </div>
          <Link href="/chef/inventory" className="ml-auto bg-white text-red-700 border border-red-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-50">
            View Inventory
          </Link>
        </div>
      </div>
    </div>
  );
} 