'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FaSearch, 
  FaClipboardList, 
  FaFireAlt, 
  FaCheckCircle,
  FaExclamationTriangle, 
  FaClock,
  FaFilter
} from 'react-icons/fa';

// Types
interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  special: string;
}

interface Order {
  id: number;
  table: string;
  items: OrderItem[];
  timeReceived: string;
  priority: 'high' | 'normal';
  status: 'pending' | 'cooking' | 'ready' | 'delivered';
  estimatedTime?: number; // in minutes
}

// Sample data
const orders: Order[] = [
  {
    id: 1042,
    table: 'Table 7',
    items: [
      { id: 1, name: 'Butter Chicken', quantity: 1, special: 'Extra spicy' },
      { id: 2, name: 'Garlic Naan', quantity: 2, special: '' },
      { id: 3, name: 'Veg Biryani', quantity: 1, special: 'No onions' }
    ],
    timeReceived: '11:45 AM',
    priority: 'high',
    status: 'pending'
  },
  {
    id: 1041,
    table: 'Table 3',
    items: [
      { id: 4, name: 'Masala Dosa', quantity: 2, special: '' },
      { id: 5, name: 'Sambar', quantity: 2, special: '' }
    ],
    timeReceived: '11:40 AM',
    priority: 'normal',
    status: 'pending'
  },
  {
    id: 1040,
    table: 'Table 12',
    items: [
      { id: 6, name: 'Paneer Tikka', quantity: 1, special: '' },
      { id: 7, name: 'Tandoori Roti', quantity: 3, special: '' },
      { id: 8, name: 'Dal Makhani', quantity: 1, special: 'Less cream' },
      { id: 9, name: 'Jeera Rice', quantity: 2, special: '' }
    ],
    timeReceived: '11:35 AM',
    priority: 'normal',
    status: 'cooking',
    estimatedTime: 12
  },
  {
    id: 1039,
    table: 'Takeaway',
    items: [
      { id: 10, name: 'Chicken Biryani', quantity: 2, special: '' },
      { id: 11, name: 'Raita', quantity: 1, special: '' }
    ],
    timeReceived: '11:30 AM',
    priority: 'high',
    status: 'cooking',
    estimatedTime: 8
  },
  {
    id: 1038,
    table: 'Table 5',
    items: [
      { id: 12, name: 'Malai Kofta', quantity: 1, special: '' },
      { id: 13, name: 'Butter Naan', quantity: 2, special: '' }
    ],
    timeReceived: '11:25 AM',
    priority: 'normal',
    status: 'ready'
  },
  {
    id: 1037,
    table: 'Table 9',
    items: [
      { id: 14, name: 'Dal Tadka', quantity: 1, special: '' },
      { id: 15, name: 'Plain Rice', quantity: 1, special: '' },
      { id: 16, name: 'Roti', quantity: 4, special: '' }
    ],
    timeReceived: '11:20 AM',
    priority: 'normal',
    status: 'delivered'
  }
];

export default function OrdersQueuePage() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'priority'>('newest');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      // Filter by status
      if (filterStatus !== 'all' && order.status !== filterStatus) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const hasMatchingItem = order.items.some(item => 
          item.name.toLowerCase().includes(searchLower) ||
          item.special.toLowerCase().includes(searchLower)
        );
        
        return (
          order.table.toLowerCase().includes(searchLower) ||
          `Order #${order.id}`.toLowerCase().includes(searchLower) ||
          hasMatchingItem
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by selected order
      if (sortOrder === 'priority') {
        return a.priority === 'high' && b.priority !== 'high' ? -1 : 
               b.priority === 'high' && a.priority !== 'high' ? 1 : 0;
      } else {
        // Convert time strings to comparable values (simple approach for demo)
        const timeA = a.timeReceived;
        const timeB = b.timeReceived;
        return sortOrder === 'newest' ? 
          timeB.localeCompare(timeA) : 
          timeA.localeCompare(timeB);
      }
    });

  // Get counts by status
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const cookingCount = orders.filter(o => o.status === 'cooking').length;
  const readyCount = orders.filter(o => o.status === 'ready').length;

  // Function to determine status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch(status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'cooking':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to get status icon
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending':
        return <FaClipboardList className="text-amber-500" />;
      case 'cooking':
        return <FaFireAlt className="text-orange-500" />;
      case 'ready':
        return <FaCheckCircle className="text-green-500" />;
      case 'delivered':
        return <FaClock className="text-gray-500" />;
      default:
        return null;
    }
  };

  // Function to handle status change
  const handleStatusChange = (orderId: number, newStatus: 'pending' | 'cooking' | 'ready' | 'delivered') => {
    console.log(`Changing order #${orderId} status to ${newStatus}`);
    // This would update state in a real application
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Orders Queue</h1>
        <p className="text-gray-600">Manage kitchen orders and track their progress</p>
      </div>

      {/* Status count cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">All Orders</p>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full">
              <FaClipboardList className="text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <FaClipboardList className="text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Cooking</p>
              <p className="text-2xl font-bold">{cookingCount}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <FaFireAlt className="text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Ready</p>
              <p className="text-2xl font-bold">{readyCount}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaCheckCircle className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search orders..."
            />
          </div>
          
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-500" />
              <select 
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="cooking">Cooking</option>
                <option value="ready">Ready</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <FaClock className="text-gray-500" />
              <select 
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest' | 'priority')}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Priority First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders list */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredOrders.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <div key={order.id} className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                  <div className="flex items-center mb-2 md:mb-0">
                    <span className={`h-3 w-3 rounded-full mr-2 ${
                      order.priority === 'high' ? 'bg-red-500' : 'bg-amber-500'
                    }`}></span>
                    <h3 className="text-lg font-semibold mr-3">Order #{order.id}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeStyle(order.status)}`}>
                      <div className="flex items-center">
                        <span className="mr-1">{getStatusIcon(order.status)}</span>
                        <span className="capitalize">{order.status}</span>
                      </div>
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">{order.timeReceived}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700 font-medium">
                      {order.table}
                    </span>
                    {order.priority === 'high' && (
                      <span className="bg-red-100 px-2 py-1 rounded text-xs text-red-700 font-medium flex items-center">
                        <FaExclamationTriangle className="mr-1" />
                        High Priority
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md mb-3">
                  <ul className="space-y-2">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex items-start">
                        <span className="font-medium">{item.quantity}×</span>
                        <div className="ml-2">
                          <div className="font-medium">{item.name}</div>
                          {item.special && (
                            <div className="text-sm text-red-600">{item.special}</div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {order.status === 'pending' && (
                    <button 
                      onClick={() => handleStatusChange(order.id, 'cooking')}
                      className="px-4 py-2 bg-amber-500 text-white rounded-md font-medium flex items-center hover:bg-amber-600"
                    >
                      <FaFireAlt className="mr-2" />
                      Start Cooking
                    </button>
                  )}
                  
                  {order.status === 'cooking' && (
                    <>
                      <div className="flex items-center text-orange-700 mr-4">
                        <FaClock className="mr-1" />
                        <span>Est. ready in {order.estimatedTime} min</span>
                      </div>
                      <button 
                        onClick={() => handleStatusChange(order.id, 'ready')}
                        className="px-4 py-2 bg-green-500 text-white rounded-md font-medium flex items-center hover:bg-green-600"
                      >
                        <FaCheckCircle className="mr-2" />
                        Mark as Ready
                      </button>
                    </>
                  )}
                  
                  {order.status === 'ready' && (
                    <button 
                      onClick={() => handleStatusChange(order.id, 'delivered')}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md font-medium flex items-center hover:bg-gray-600"
                    >
                      <FaClock className="mr-2" />
                      Mark as Delivered
                    </button>
                  )}
                  
                  <Link
                    href={`/chef/orders/${order.id}`}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <FaClipboardList className="text-gray-300 text-4xl mx-auto mb-4" />
            <p className="text-gray-500">No orders found matching your filters.</p>
            <button 
              onClick={() => {
                setFilterStatus('all');
                setSearchTerm('');
                setSortOrder('newest');
              }}
              className="mt-2 text-indigo-600 hover:text-indigo-800"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 