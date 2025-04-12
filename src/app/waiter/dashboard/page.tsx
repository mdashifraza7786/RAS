'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FaUtensils, 
  FaMoneyBillWave, 
  FaBell, 
  FaClipboardList,
  FaUsers,
  FaTable,
  FaCalendarAlt,
  FaSpinner
} from 'react-icons/fa';
import { useStats, WaiterStats } from '@/hooks/useStats';
import { WaiterStatCards } from '@/components/dashboard/StatCards';

export default function WaiterDashboard() {
  // Fetch dashboard stats
  const { stats, loading, error, refreshStats } = useStats();

  // Check if the stats are for waiter role
  const isWaiterStats = (stats: any): stats is WaiterStats => {
    return stats && 'activeOrders' in stats;
  };

  // Quick action links for waiter dashboard
  const quickActions = [
    { 
      title: 'Take Order', 
      icon: <FaClipboardList className="text-2xl" />, 
      description: 'Create a new customer order',
      link: '/waiter/orders/new',
      bgColor: 'bg-blue-600' 
    },
    { 
      title: 'Process Payment', 
      icon: <FaMoneyBillWave className="text-2xl" />, 
      description: 'Generate bill and process payment',
      link: '/waiter/bills/new',
      bgColor: 'bg-green-600'
    },
    { 
      title: 'Table Status', 
      icon: <FaTable className="text-2xl" />, 
      description: 'View and manage table status',
      link: '/waiter/tables',
      bgColor: 'bg-amber-600'
    },
    { 
      title: 'View Orders', 
      icon: <FaUtensils className="text-2xl" />, 
      description: 'Check status of all orders',
      link: '/waiter/orders',
      bgColor: 'bg-indigo-600'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Waiter Dashboard</h1>
        <p className="text-gray-600">Here&apos;s your overview for today</p>
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
          <button 
            onClick={refreshStats}
            className="mt-2 px-4 py-2 bg-red-200 text-red-700 rounded hover:bg-red-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Cards */}
      {!loading && !error && stats && isWaiterStats(stats) && (
        <WaiterStatCards stats={stats} />
      )}

      {/* Quick Actions Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link 
              key={index} 
              href={action.link}
              className="block"
            >
              <div className={`${action.bgColor} text-white rounded-lg shadow-md p-6 h-full hover:shadow-lg transition duration-200`}>
                <div className="flex flex-col h-full">
                  <div className="mb-4">{action.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
                  <p className="text-white text-opacity-80 text-sm mb-4">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Active Orders Section */}
      {!loading && !error && stats && isWaiterStats(stats) && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Active Orders</h2>
          {stats.activeOrders.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.activeOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium">#{order.orderNumber}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {typeof order.table === 'string' ? order.table : order.table?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'ready' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.items.length} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          href={`/waiter/orders/${order._id}`}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
              <FaClipboardList className="mx-auto text-gray-400 text-4xl mb-4" />
              <p className="text-lg">No active orders at the moment</p>
              <p className="mt-2">Create a new order using the "Take Order" quick action</p>
            </div>
          )}
        </div>
      )}

      {/* Tables Overview */}
      {!loading && !error && stats && isWaiterStats(stats) && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Tables Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {stats.tables.map((table) => (
              <Link 
                key={table._id}
                href="/waiter/tables"
                className="bg-white rounded-lg shadow p-4 flex flex-col items-center hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  table.status === 'available' ? 'bg-green-100 text-green-600' :
                  table.status === 'occupied' ? 'bg-red-100 text-red-600' :
                  table.status === 'reserved' ? 'bg-blue-100 text-blue-600' :
                  'bg-amber-100 text-amber-600'
                }`}>
                  <FaTable />
                </div>
                <h3 className="font-medium">{table.name}</h3>
                <p className={`text-xs mt-1 px-2 py-0.5 rounded-full ${
                  table.status === 'available' ? 'bg-green-100 text-green-600' :
                  table.status === 'occupied' ? 'bg-red-100 text-red-600' :
                  table.status === 'reserved' ? 'bg-blue-100 text-blue-600' :
                  'bg-amber-100 text-amber-600'
                }`}>
                  {table.status}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 