'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaClipboardList, 
  FaHamburger, 
  FaExclamationTriangle,
  FaClipboardCheck,
  FaFireAlt,
  FaRegClock,
  FaCheckCircle,
  FaSpinner
} from 'react-icons/fa';
import axios from 'axios';

export default function ChefDashboard() {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      pendingOrders: 0,
      inProgressOrders: 0,
      readyOrders: 0,
      lowInventoryItems: 0
    },
    pendingOrders: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch orders data
        const ordersResponse = await axios.get('/api/orders?role=chef');
        
        // Get inventory low items count
        const inventoryResponse = await axios.get('/api/chef/inventory/low');
        
        // Fetch recent activity
        const activityResponse = await axios.get('/api/chef/activity?limit=5');
        
        // Count orders by status
        const allOrders = ordersResponse.data.orders || [];
        const pendingOrders = allOrders.filter(order => order.status === 'pending');
        const inProgressOrders = allOrders.filter(order => order.status === 'in-progress');
        const readyOrders = allOrders.filter(order => order.status === 'ready');
        
        // Prepare dashboard data
        setDashboardData({
          stats: {
            pendingOrders: pendingOrders.length,
            inProgressOrders: inProgressOrders.length,
            readyOrders: readyOrders.length,
            lowInventoryItems: (inventoryResponse.data.items || []).length
          },
          pendingOrders: pendingOrders.map(order => ({
            id: order.orderNumber || order._id.toString().slice(-6),
            table: typeof order.table === 'string' ? order.table : order.table?.name || 'Unknown',
            items: order.items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              special: item.specialInstructions || ''
            })),
            timeReceived: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            priority: order.priority || 'normal'
          })),
          recentActivity: activityResponse.data.activities.slice(0, 5)
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Quick stats for the dashboard
  const quickStats = [
    { 
      title: 'Pending Orders', 
      value: dashboardData.stats.pendingOrders.toString(), 
      icon: <FaClipboardList className="h-6 w-6 text-amber-500" />,
      link: '/chef/orders?status=pending',
      description: 'Orders waiting to be prepared'
    },
    { 
      title: 'In Progress', 
      value: dashboardData.stats.inProgressOrders.toString(), 
      icon: <FaFireAlt className="h-6 w-6 text-orange-500" />,
      link: '/chef/orders?status=in-progress',
      description: 'Currently being prepared'
    },
    { 
      title: 'Ready to Serve', 
      value: dashboardData.stats.readyOrders.toString(), 
      icon: <FaCheckCircle className="h-6 w-6 text-green-500" />,
      link: '/chef/orders?status=ready',
      description: 'Complete and ready for pickup'
    },
    { 
      title: 'Low Inventory', 
      value: dashboardData.stats.lowInventoryItems.toString(), 
      icon: <FaExclamationTriangle className="h-6 w-6 text-red-500" />,
      link: '/chef/inventory',
      description: 'Items running low'
    },
  ];

  const quickActions = [
    { 
      title: 'Start Cooking', 
      icon: <FaFireAlt className="h-5 w-5" />,
      link: '/chef/orders?status=pending',
      color: 'bg-amber-600 hover:bg-amber-700'
    },
    { 
      title: 'Mark Ready', 
      icon: <FaClipboardCheck className="h-5 w-5" />,
      link: '/chef/orders?status=in-progress',
      color: 'bg-green-600 hover:bg-green-700'
    },
  ];

  // Helper function to get icon for activity
  const getActivityIcon = (type) => {
    switch (type) {
      case 'order_new':
        return <FaClipboardList className="h-4 w-4 text-blue-500" />;
      case 'order_cooking':
        return <FaFireAlt className="h-4 w-4 text-orange-500" />;
      case 'order_ready':
        return <FaCheckCircle className="h-4 w-4 text-green-500" />;
      case 'order_completed':
        return <FaCheckCircle className="h-4 w-4 text-indigo-500" />;
      case 'inventory_low':
        return <FaExclamationTriangle className="h-4 w-4 text-red-500" />;
      case 'inventory_update':
        return <FaRegClock className="h-4 w-4 text-gray-500" />;
      case 'menu_update':
        return <FaHamburger className="h-4 w-4 text-amber-500" />;
      default:
        return <FaRegClock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[60vh]">
        <FaSpinner className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          <h2 className="text-lg font-semibold">Error loading dashboard</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

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
            <Link href="/chef/orders?status=pending" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              View All
            </Link>
          </div>
          
          {dashboardData.pendingOrders.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {dashboardData.pendingOrders.map((order) => (
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
                    <Link href={`/chef/orders/${order.id}`} className="bg-amber-500 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-amber-600">
                      Start Cooking
                    </Link>
                    <Link href={`/chef/orders/${order.id}`} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-300">
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <p className="text-gray-500">No pending orders at the moment</p>
            </div>
          )}
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
          </div>
          
          {dashboardData.recentActivity.length > 0 ? (
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
            <div className="p-10 text-center">
              <p className="text-gray-500">No recent activity</p>
            </div>
          )}
          
          <div className="bg-gray-50 px-6 py-3">
            <Link href="/chef/activity" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              View all activity
            </Link>
          </div>
        </div>
      </div>
      
      {/* Inventory Alert - Only show if there are low inventory items */}
      {dashboardData.stats.lowInventoryItems > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-500 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-red-800">Low Inventory Alert</h3>
              <p className="text-sm text-red-700">
                {dashboardData.stats.lowInventoryItems} items are below the minimum threshold
              </p>
            </div>
            <Link href="/chef/inventory" className="ml-auto bg-white text-red-700 border border-red-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-50">
              View Inventory
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 