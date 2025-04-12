'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaPrint, 
  FaCheckCircle, 
  FaTruck, 
  FaTimesCircle,
  FaCalendarAlt,
  FaSortAmountDown,
  FaHourglassHalf
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { IOrder, OrderItem } from '@/models/Order';

// Define our extended Table type
interface TableData {
  _id: string;
  number: number;
  name: string;
  status: string;
  capacity: number;
}

// Define our extended User type
interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
}

// Define our Order type from the API
interface Order extends Omit<IOrder, '_id' | 'table' | 'waiter'> {
  _id: string;
  status: 'pending' | 'in-progress' | 'ready' | 'served' | 'completed' | 'cancelled';
  table: TableData | string;
  waiter?: UserData | string;
}

// Status options for filtering
const statusOptions = ['All Status', 'pending', 'in-progress', 'ready', 'served', 'completed', 'cancelled'];

// Date range options for filtering
const dateRangeOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' }
];

// Format date string to a readable format
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit'
  });
};

// Check if a date falls within a specific range
const isDateInRange = (dateString: string, range: string): boolean => {
  const orderDate = new Date(dateString);
  const now = new Date();
  
  // Reset time to start of day for accurate day comparisons
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday as first day
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  switch (range) {
    case 'today':
      return orderDate >= today && orderDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
    case 'yesterday':
      return orderDate >= yesterday && orderDate < today;
    case 'week':
      return orderDate >= startOfWeek && orderDate < now;
    case 'month':
      return orderDate >= startOfMonth && orderDate < now;
    default:
      return true; // 'all' or invalid ranges
  }
};

// Get appropriate status badge styling
const getStatusBadgeStyles = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-gray-100 text-gray-800';
    case 'in-progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'ready':
      return 'bg-blue-100 text-blue-800';
    case 'served':
      return 'bg-indigo-100 text-indigo-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get appropriate status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <FaHourglassHalf className="mr-1" />;
    case 'in-progress':
      return <FaFilter className="mr-1" />;
    case 'ready':
    case 'served':
      return <FaTruck className="mr-1" />;
    case 'completed':
      return <FaCheckCircle className="mr-1" />;
    case 'cancelled':
      return <FaTimesCircle className="mr-1" />;
    default:
      return null;
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [dateRange, setDateRange] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Fetch orders from API on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Apply filters whenever filter criteria change
  useEffect(() => {
    filterOrders();
  }, [searchQuery, selectedStatus, dateRange, allOrders]);

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/manager/orders', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 401) {
        setError('You are not authorized to view orders. Please login as a manager.');
        setIsLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      setAllOrders(data.orders);
      setPagination(data.pagination);
      
      // Initial filtering will happen in the useEffect
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching orders');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter orders based on current filter criteria
  const filterOrders = () => {
    let filtered = [...allOrders];
    
    // Apply status filter
    if (selectedStatus !== 'All Status') {
      filtered = filtered.filter(order => order.status === selectedStatus.toLowerCase());
    }
    
    // Apply date range filter
    if (dateRange !== 'all') {
      filtered = filtered.filter(order => isDateInRange(order.createdAt.toString(), dateRange));
    }
    
    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => {
        const orderNumberMatch = order.orderNumber.toString().includes(query);
        const customerNameMatch = order.customerName && order.customerName.toLowerCase().includes(query);
        return orderNumberMatch || (customerNameMatch || false);
      });
    }
    
    // Sort by createdAt date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setOrders(filtered);
  };

  // Toggle order details expansion
  const toggleOrderDetails = (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: 'pending' | 'in-progress' | 'ready' | 'served' | 'completed' | 'cancelled') => {
    try {
      const response = await fetch('/api/manager/orders', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          status: newStatus
        }),
      });
      
      if (response.status === 401) {
        toast.error('You are not authorized to update orders. Please login as a manager.');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update order status');
      }
      
      // Update local state without relying on the response
      setAllOrders(prev => 
        prev.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order status');
      console.error('Error updating order status:', err);
    }
  };

  // Calculate order summary counts
  const getStatusCount = (status: string) => {
    return allOrders.filter(order => order.status === status).length;
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
        <p className="text-gray-600">View and manage customer orders</p>
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white p-5 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by order number or customer..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          
          <div className="flex space-x-4">
            <div className="relative">
              <select 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="relative">
              <select 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                {dateRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading and Error States */}
      {isLoading && (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading orders...</p>
        </div>
      )}
      
      {error && !isLoading && (
        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={fetchOrders}
            className="mt-2 text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}
      
      {/* Orders List */}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order No.</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      Date & Time
                      <FaSortAmountDown className="ml-1 text-gray-400" size={12} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <React.Fragment key={order._id}>
                      <tr className={`hover:bg-gray-50 ${expandedOrderId === order._id ? 'bg-indigo-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.orderNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.customerName || 'Anonymous'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(order.createdAt.toString())}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {order.table && (
                            <span>Table #{typeof order.table === 'object' && 'number' in order.table ? order.table.number : '?'}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.items.length}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{order.total.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`flex items-center px-2.5 py-1 text-xs rounded-full ${getStatusBadgeStyles(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="capitalize">{order.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{order.paymentStatus}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-3">
                            <button 
                              onClick={() => toggleOrderDetails(order._id)}
                              className="text-indigo-600 hover:text-indigo-900"
                              aria-label="View order details"
                            >
                              <FaEye />
                            </button>
                            <button 
                              className="text-gray-600 hover:text-gray-900"
                              aria-label="Print order"
                            >
                              <FaPrint />
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Order Details */}
                      {expandedOrderId === order._id && (
                        <tr className="bg-indigo-50">
                          <td colSpan={9} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-800 mb-2">Order Information</h4>
                                <p className="text-sm text-gray-600">Order #: {order.orderNumber}</p>
                                <p className="text-sm text-gray-600">Date: {formatDate(order.createdAt.toString())}</p>
                                <p className="text-sm text-gray-600">Status: <span className="capitalize">{order.status}</span></p>
                                {order.specialInstructions && (
                                  <p className="text-sm text-gray-600 mt-2">
                                    <span className="font-medium">Special Instructions:</span><br />
                                    {order.specialInstructions}
                                  </p>
                                )}
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-800 mb-2">Customer Information</h4>
                                <p className="text-sm text-gray-600">Name: {order.customerName || 'Anonymous'}</p>
                                <p className="text-sm text-gray-600">
                                  Table: {typeof order.table === 'object' && 'number' in order.table 
                                    ? `#${order.table.number}` 
                                    : 'N/A'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Waiter: {typeof order.waiter === 'object' && order.waiter && 'name' in order.waiter 
                                    ? order.waiter.name 
                                    : 'N/A'}
                                </p>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-800 mb-2">Payment Information</h4>
                                <p className="text-sm text-gray-600">Method: {order.paymentMethod || 'Not specified'}</p>
                                <p className="text-sm text-gray-600">Status: <span className="capitalize">{order.paymentStatus}</span></p>
                                <p className="text-sm text-gray-600">Subtotal: ₹{order.subtotal.toFixed(2)}</p>
                                <p className="text-sm text-gray-600">Tax: ₹{order.tax.toFixed(2)}</p>
                                <p className="text-sm font-medium text-gray-900">Total: ₹{order.total.toFixed(2)}</p>
                              </div>
                            </div>
                            
                            {/* Order Items */}
                            <div className="mt-4 pt-4 border-t border-indigo-100">
                              <h4 className="text-sm font-medium text-gray-800 mb-3">Order Items</h4>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-indigo-50/50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-indigo-100">
                                    {order.items.map((item: OrderItem, index: number) => (
                                      <tr key={index} className="hover:bg-indigo-50/50">
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{item.name}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">₹{item.price.toFixed(2)}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{item.quantity}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 capitalize">{item.status}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            
                            {/* Order Actions */}
                            <div className="flex mt-4 pt-4 border-t border-indigo-100">
                              <h4 className="text-sm font-medium text-gray-800 mr-4">Update Status:</h4>
                              <div className="flex flex-wrap gap-2">
                                {order.status !== 'pending' && (
                                  <button 
                                    onClick={() => updateOrderStatus(order._id, 'pending')}
                                    className="px-3 py-1 text-xs rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200"
                                  >
                                    Pending
                                  </button>
                                )}
                                {order.status !== 'in-progress' && (
                                  <button 
                                    onClick={() => updateOrderStatus(order._id, 'in-progress')}
                                    className="px-3 py-1 text-xs rounded-md bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                  >
                                    In Progress
                                  </button>
                                )}
                                {order.status !== 'ready' && (
                                  <button 
                                    onClick={() => updateOrderStatus(order._id, 'ready')}
                                    className="px-3 py-1 text-xs rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200"
                                  >
                                    Ready
                                  </button>
                                )}
                                {order.status !== 'served' && (
                                  <button 
                                    onClick={() => updateOrderStatus(order._id, 'served')}
                                    className="px-3 py-1 text-xs rounded-md bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                                  >
                                    Served
                                  </button>
                                )}
                                {order.status !== 'completed' && (
                                  <button 
                                    onClick={() => updateOrderStatus(order._id, 'completed')}
                                    className="px-3 py-1 text-xs rounded-md bg-green-100 text-green-800 hover:bg-green-200"
                                  >
                                    Completed
                                  </button>
                                )}
                                {order.status !== 'cancelled' && (
                                  <button 
                                    onClick={() => updateOrderStatus(order._id, 'cancelled')}
                                    className="px-3 py-1 text-xs rounded-md bg-red-100 text-red-800 hover:bg-red-200"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      No orders found. Try adjusting your search or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{orders.length}</span> of <span className="font-medium">{allOrders.length}</span> orders
            </div>
            <div className="flex space-x-2">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => fetchOrders()}
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Order Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-gray-500">
          <h3 className="text-sm font-medium text-gray-800 mb-1">Pending</h3>
          <p className="text-2xl font-bold text-gray-900">
            {getStatusCount('pending')}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
          <h3 className="text-sm font-medium text-gray-800 mb-1">In Progress</h3>
          <p className="text-2xl font-bold text-gray-900">
            {getStatusCount('in-progress')}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-800 mb-1">Ready</h3>
          <p className="text-2xl font-bold text-gray-900">
            {getStatusCount('ready')}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-indigo-500">
          <h3 className="text-sm font-medium text-gray-800 mb-1">Served</h3>
          <p className="text-2xl font-bold text-gray-900">
            {getStatusCount('served')}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-800 mb-1">Completed</h3>
          <p className="text-2xl font-bold text-gray-900">
            {getStatusCount('completed')}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
          <h3 className="text-sm font-medium text-gray-800 mb-1">Cancelled</h3>
          <p className="text-2xl font-bold text-gray-900">
            {getStatusCount('cancelled')}
          </p>
        </div>
      </div>
    </div>
  );
} 